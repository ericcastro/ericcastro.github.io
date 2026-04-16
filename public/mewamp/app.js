const DEFAULT_LAST_FM_URL = "/api/recent-tracks";
const DEFAULT_TRACK_DURATION_SECONDS = 180;
const SEARCH_CONCURRENCY = 4;
const SEARCH_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const TIMEUPDATE_POLL_INTERVAL_MS = 250;
const SEARCH_CACHE_PREFIX = "mewamp-search-v1";
const SERVER_SEARCH_ENDPOINT = "/api/youtube-search";
const MEDIA_URL_PREFIX = "https://mewamp.invalid/track/";
const NEGATIVE_HINTS = [
  "cover",
  "live",
  "karaoke",
  "reaction",
  "slowed",
  "sped up",
  "nightcore",
  "8d",
  "fan made",
  "fanmade",
  "remix"
];

const config = {
  lastFmUrl: DEFAULT_LAST_FM_URL,
  youtubeApiKey: "",
  ...(window.MEWAMP_CONFIG || {})
};

const dom = {
  reloadButton: document.getElementById("reloadButton"),
  webampStage: document.getElementById("webampStage"),
  statusPrimary: document.getElementById("statusPrimary"),
  statusSecondary: document.getElementById("statusSecondary"),
  playlistCount: document.getElementById("playlistCount"),
  resolverMode: document.getElementById("resolverMode"),
  youtubePlayer: document.getElementById("youtubePlayer"),
  youtubePlaceholder: document.getElementById("youtubePlaceholder"),
  youtubeStatus: document.getElementById("youtubeStatus"),
  matchMeta: document.getElementById("matchMeta"),
  trackArtwork: document.getElementById("trackArtwork"),
  trackTitle: document.getElementById("trackTitle"),
  trackArtist: document.getElementById("trackArtist"),
  trackAlbum: document.getElementById("trackAlbum"),
  trackPlayedAt: document.getElementById("trackPlayedAt"),
  openYoutubeButton: document.getElementById("openYoutubeButton"),
  openLastfmButton: document.getElementById("openLastfmButton")
};

const state = {
  webamp: null,
  youtubePlayer: null,
  youtubeApiPromise: null,
  youtubePlayerPromise: null,
  youtubePlayerReady: false,
  currentTrack: null,
  currentVideoId: null,
  recentTracks: [],
  readyTrackCount: 0,
  activeMedia: null,
  trackByMediaUrl: new Map(),
  timeupdatePoller: null,
  lastPlaybackTime: 0,
  pendingVolume: Math.round((200 / 255) * 100)
};

class SimpleEmitter {
  constructor() {
    this.listeners = new Map();
  }

  on(event, callback) {
    const callbacks = this.listeners.get(event) || new Set();
    callbacks.add(callback);
    this.listeners.set(event, callbacks);
  }

  trigger(event, ...args) {
    const callbacks = this.listeners.get(event);
    if (!callbacks) {
      return;
    }

    for (const callback of callbacks) {
      callback(...args);
    }
  }

  dispose() {
    this.listeners.clear();
  }
}

class YoutubeBackedMedia {
  constructor() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this._emitter = new SimpleEmitter();
    this._context = new AudioContextClass();
    this._analyser = this._context.createAnalyser();
    this._analyser.fftSize = 2048;
    this._analyser.smoothingTimeConstant = 0;
    this._loadedTrack = null;
    state.activeMedia = this;
  }

  _emit(event, ...args) {
    this._emitter.trigger(event, ...args);
  }

  on(event, callback) {
    this._emitter.on(event, callback);
  }

  getAnalyser() {
    return this._analyser;
  }

  duration() {
    const fallback = this._loadedTrack?.durationSeconds || DEFAULT_TRACK_DURATION_SECONDS;
    return getCurrentYoutubeDuration(fallback);
  }

  timeElapsed() {
    return readCurrentYoutubeTime();
  }

  async play() {
    if (!this._loadedTrack) {
      return;
    }

    await playCurrentYoutubeTrack(this._loadedTrack);
  }

  pause() {
    pauseCurrentYoutubeTrack();
    this._emit("timeupdate");
  }

  stop() {
    stopCurrentYoutubeTrack();
    this._emit("timeupdate");
  }

  seekToPercentComplete(percent) {
    const duration = this.duration();
    const safePercent = Math.min(Math.max(percent, 0), 100);
    const time = duration * (safePercent / 100);
    seekCurrentYoutubeTrack(time);
    this._emit("timeupdate");
  }

  async loadFromUrl(url, autoPlay) {
    const track = state.trackByMediaUrl.get(url) || null;
    state.activeMedia = this;
    this._loadedTrack = track;

    if (!track) {
      setYoutubeStatus("Webamp asked for an unknown track URL.");
      setMatchMeta("The custom media bridge could not resolve this playlist entry.");
      this._emit("stopWaiting");
      return;
    }

    this._emit("waiting");

    try {
      await loadTrackIntoYoutube(track, autoPlay);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown YouTube bridge error.";
      togglePlaceholder(false);
      setYoutubeStatus("The YouTube bridge could not load this track cleanly.");
      setMatchMeta(message);
      this._emit("stopWaiting");
      return;
    }

    this._emit("fileLoaded");

    if (!autoPlay || !track.match?.videoId) {
      this._emit("stopWaiting");
      this._emit("timeupdate");
    }
  }

  setVolume(volume) {
    rememberYoutubeVolume(volume);
  }

  setBalance() {
    // The YouTube embed does not expose channel balance control.
  }

  setPreamp() {
    // The YouTube embed does not expose an audio graph for EQ/preamp control.
  }

  setEqBand() {
    // The YouTube embed does not expose an audio graph for EQ/preamp control.
  }

  disableEq() {
    // The YouTube embed does not expose an audio graph for EQ/preamp control.
  }

  enableEq() {
    // The YouTube embed does not expose an audio graph for EQ/preamp control.
  }

  dispose() {
    if (state.activeMedia === this) {
      state.activeMedia = null;
    }

    this._emitter.dispose();
    void this._context.close().catch(() => {});
  }
}

function setPrimaryStatus(message) {
  dom.statusPrimary.textContent = message;
}

function setSecondaryStatus(message) {
  dom.statusSecondary.textContent = message;
}

function setPlaylistCount(ready, total) {
  dom.playlistCount.textContent = `${ready} / ${total} tracks ready`;
}

function setResolverMode() {
  dom.resolverMode.textContent = config.youtubeApiKey
    ? "Lookup mode: browser-side YouTube Data API"
    : "Lookup mode: Cloudflare Pages fallback";
}

function setYoutubeStatus(message) {
  dom.youtubeStatus.textContent = message;
}

function setMatchMeta(message) {
  dom.matchMeta.textContent = message;
}

function setActionLink(anchor, href, enabled) {
  anchor.href = href;
  anchor.classList.toggle("disabled", !enabled);
  anchor.setAttribute("aria-disabled", String(!enabled));
}

function togglePlaceholder(hidden) {
  dom.youtubePlaceholder.classList.toggle("is-hidden", hidden);
}

function normalizeText(value) {
  return (value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokenize(value) {
  return normalizeText(value)
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

function stripFeaturing(title) {
  return title.replace(/\s*\((feat|ft)\.[^)]+\)\s*/gi, " ").replace(/\s+/g, " ").trim();
}

function pickLargestImage(imageList) {
  const images = Array.isArray(imageList) ? imageList : [];
  for (let index = images.length - 1; index >= 0; index -= 1) {
    const candidate = images[index]?.["#text"];
    if (candidate) {
      return candidate;
    }
  }
  return "";
}

function parseDurationText(value) {
  if (!value) {
    return DEFAULT_TRACK_DURATION_SECONDS;
  }

  const parts = value
    .trim()
    .split(":")
    .map((part) => Number.parseInt(part, 10))
    .filter((part) => Number.isFinite(part));

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }

  if (parts.length === 1) {
    return parts[0];
  }

  return DEFAULT_TRACK_DURATION_SECONDS;
}

function parseIsoDuration(value) {
  const match =
    /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i.exec(value || "") || [];
  const hours = Number.parseInt(match[1] || "0", 10);
  const minutes = Number.parseInt(match[2] || "0", 10);
  const seconds = Number.parseInt(match[3] || "0", 10);
  return hours * 3600 + minutes * 60 + seconds;
}

function scoreCandidate(track, candidate) {
  const trackTitle = normalizeText(track.title);
  const bareTrackTitle = normalizeText(stripFeaturing(track.title));
  const artist = normalizeText(track.artist);
  const album = normalizeText(track.album);
  const candidateTitle = normalizeText(candidate.title);
  const candidateChannel = normalizeText(candidate.channelTitle);
  const candidateCombined = `${candidateTitle} ${candidateChannel}`;

  let score = 0;

  if (trackTitle && candidateTitle.includes(trackTitle)) {
    score += 48;
  }

  if (bareTrackTitle && candidateTitle.includes(bareTrackTitle)) {
    score += 30;
  }

  if (artist && candidateCombined.includes(artist)) {
    score += 24;
  }

  if (album && candidateCombined.includes(album)) {
    score += 6;
  }

  for (const token of tokenize(stripFeaturing(track.title))) {
    if (candidateTitle.includes(token)) {
      score += 4;
    }
  }

  for (const token of tokenize(track.artist)) {
    if (candidateCombined.includes(token)) {
      score += 3;
    }
  }

  if (candidate.isOfficialArtist) {
    score += 18;
  }

  if (/official audio|provided to youtube|topic/.test(candidateCombined)) {
    score += 12;
  }

  if (candidate.durationSeconds >= 90 && candidate.durationSeconds <= 720) {
    score += 4;
  }

  for (const hint of NEGATIVE_HINTS) {
    if (candidateTitle.includes(hint)) {
      score -= 24;
    }
  }

  return score;
}

function createSearchCacheKey(track) {
  return `${SEARCH_CACHE_PREFIX}:${normalizeText(track.artist)}:${normalizeText(track.title)}`;
}

function getCachedSearch(track) {
  try {
    const raw = window.localStorage.getItem(createSearchCacheKey(track));
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || Date.now() - parsed.savedAt > SEARCH_CACHE_TTL_MS) {
      return null;
    }

    return parsed.payload || null;
  } catch {
    return null;
  }
}

function saveCachedSearch(track, payload) {
  try {
    window.localStorage.setItem(
      createSearchCacheKey(track),
      JSON.stringify({
        savedAt: Date.now(),
        payload
      })
    );
  } catch {
    // Ignore quota and privacy mode errors.
  }
}

function createTrackMediaUrl(track) {
  return `${MEDIA_URL_PREFIX}${track.index}`;
}

function normalizeRecentTrack(track, index) {
  const artist = track?.artist?.name || track?.artist?.["#text"] || "Unknown Artist";
  const title = track?.name || "Unknown Track";
  const album = track?.album?.["#text"] || "Album unknown";
  const lastPlayedText = track?.["@attr"]?.nowplaying
    ? "Now playing on Last.fm"
    : track?.date?.["#text"] || "Recently played";

  return {
    index,
    artist,
    title,
    album,
    lastPlayedText,
    lastPlayedUts: Number.parseInt(track?.date?.uts || "0", 10) || 0,
    nowPlaying: track?.["@attr"]?.nowplaying === "true",
    lastFmUrl: track?.url || "https://www.last.fm/user/eric_castro",
    artworkUrl: pickLargestImage(track?.image || track?.artist?.image),
    identity: `${normalizeText(artist)}::${normalizeText(title)}`
  };
}

async function fetchRecentTracks() {
  const response = await fetch(config.lastFmUrl);

  if (!response.ok) {
    throw new Error(`Last.fm responded with ${response.status}.`);
  }

  const payload = await response.json();
  const items = Array.isArray(payload?.recenttracks?.track)
    ? payload.recenttracks.track
    : [];

  return items.map(normalizeRecentTrack);
}

async function searchViaCloudflare(track, query) {
  const url = new URL(SERVER_SEARCH_ENDPOINT, window.location.origin);
  url.searchParams.set("q", query);
  url.searchParams.set("artist", track.artist);
  url.searchParams.set("track", track.title);
  url.searchParams.set("album", track.album);

  const response = await fetch(url, {
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Search endpoint responded with ${response.status}.`);
  }

  const payload = await response.json();
  return payload?.best || null;
}

async function searchViaYouTubeApi(track, query) {
  const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
  searchUrl.search = new URLSearchParams({
    part: "snippet",
    type: "video",
    maxResults: "8",
    q: query,
    key: config.youtubeApiKey,
    videoCategoryId: "10"
  }).toString();

  const searchResponse = await fetch(searchUrl);
  if (!searchResponse.ok) {
    throw new Error(`YouTube search responded with ${searchResponse.status}.`);
  }

  const searchPayload = await searchResponse.json();
  const ids = (searchPayload.items || [])
    .map((item) => item?.id?.videoId)
    .filter(Boolean);

  if (!ids.length) {
    return null;
  }

  const detailUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
  detailUrl.search = new URLSearchParams({
    part: "snippet,contentDetails",
    id: ids.join(","),
    key: config.youtubeApiKey
  }).toString();

  const detailResponse = await fetch(detailUrl);
  if (!detailResponse.ok) {
    throw new Error(`YouTube details responded with ${detailResponse.status}.`);
  }

  const detailPayload = await detailResponse.json();
  const candidates = (detailPayload.items || []).map((item) => ({
    videoId: item.id,
    title: item?.snippet?.title || "Unknown title",
    channelTitle: item?.snippet?.channelTitle || "Unknown channel",
    durationSeconds: parseIsoDuration(item?.contentDetails?.duration),
    isOfficialArtist: /topic|official/i.test(item?.snippet?.channelTitle || ""),
    source: "youtube-data-api"
  }));

  return candidates
    .map((candidate) => ({
      ...candidate,
      score: scoreCandidate(track, candidate)
    }))
    .sort((left, right) => right.score - left.score)[0] || null;
}

async function resolveYoutubeMatch(track) {
  const cached = getCachedSearch(track);
  if (cached) {
    return cached;
  }

  const queries = [
    `${track.artist} ${track.title} official audio`,
    `${track.artist} ${stripFeaturing(track.title)} official audio`,
    `${track.artist} ${track.title}`
  ];

  for (const query of queries) {
    try {
      const result = config.youtubeApiKey
        ? await searchViaYouTubeApi(track, query)
        : await searchViaCloudflare(track, query);

      if (result?.videoId) {
        const enriched = {
          ...result,
          youtubeUrl: `https://www.youtube.com/watch?v=${result.videoId}`,
          durationSeconds: Math.max(
            result.durationSeconds || DEFAULT_TRACK_DURATION_SECONDS,
            30
          )
        };
        saveCachedSearch(track, enriched);
        return enriched;
      }
    } catch (error) {
      setMatchMeta(
        `Lookup warning: ${error instanceof Error ? error.message : "Unknown error."}`
      );
    }
  }

  return null;
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const workers = [];
  let cursor = 0;

  async function work() {
    while (true) {
      const currentIndex = cursor;
      cursor += 1;
      if (currentIndex >= items.length) {
        return;
      }
      await mapper(items[currentIndex], currentIndex);
    }
  }

  for (let count = 0; count < Math.min(concurrency, items.length); count += 1) {
    workers.push(work());
  }

  await Promise.all(workers);
}

function rememberYoutubeVolume(volume) {
  const safeVolume = Math.max(0, Math.min(100, Math.round(volume)));
  state.pendingVolume = safeVolume;

  if (state.youtubePlayerReady && state.youtubePlayer?.setVolume) {
    state.youtubePlayer.setVolume(safeVolume);
  }
}

function readCurrentYoutubeTime() {
  if (
    state.youtubePlayerReady &&
    state.currentTrack?.match?.videoId &&
    state.youtubePlayer?.getCurrentTime
  ) {
    const currentTime = Number(state.youtubePlayer.getCurrentTime());
    if (Number.isFinite(currentTime) && currentTime >= 0) {
      state.lastPlaybackTime = currentTime;
    }
  }

  return state.lastPlaybackTime;
}

function getCurrentYoutubeDuration(fallbackDuration = 0) {
  if (
    state.youtubePlayerReady &&
    state.currentTrack?.match?.videoId &&
    state.youtubePlayer?.getDuration
  ) {
    const duration = Number(state.youtubePlayer.getDuration());
    if (Number.isFinite(duration) && duration > 0) {
      return duration;
    }
  }

  return fallbackDuration;
}

function ensureTimeupdatePoller() {
  if (state.timeupdatePoller) {
    return;
  }

  state.timeupdatePoller = window.setInterval(() => {
    readCurrentYoutubeTime();
    state.activeMedia?._emit("timeupdate");
  }, TIMEUPDATE_POLL_INTERVAL_MS);
}

function stopTimeupdatePoller() {
  if (!state.timeupdatePoller) {
    return;
  }

  window.clearInterval(state.timeupdatePoller);
  state.timeupdatePoller = null;
}

function buildSearchFallbackUrl(track) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${track.artist} ${track.title}`
  )}`;
}

function describeMatch(track) {
  if (!track?.match?.videoId) {
    return `Fallback query: ${track.artist} - ${track.title}. Open the search results manually with the button below.`;
  }

  return `${track.match.title} | ${track.match.channelTitle} | ${track.match.durationSeconds}s | source: ${
    track.match.source || "unknown"
  }`;
}

function refreshTrackPanel(track) {
  if (!track) {
    dom.trackArtwork.removeAttribute("src");
    dom.trackTitle.textContent = "Waiting for a scrobble...";
    dom.trackArtist.textContent = "Nothing selected yet.";
    dom.trackAlbum.textContent = "Album unknown.";
    dom.trackPlayedAt.textContent = "Last played time unknown.";
    setActionLink(dom.openYoutubeButton, "https://www.youtube.com/", false);
    setActionLink(dom.openLastfmButton, "https://www.last.fm/user/eric_castro", false);
    return;
  }

  if (track.artworkUrl) {
    dom.trackArtwork.src = track.artworkUrl;
  } else {
    dom.trackArtwork.removeAttribute("src");
  }

  dom.trackTitle.textContent = track.title;
  dom.trackArtist.textContent = track.artist;
  dom.trackAlbum.textContent = track.album || "Album unknown.";
  dom.trackPlayedAt.textContent = track.lastPlayedText;
  setActionLink(
    dom.openYoutubeButton,
    track.match?.youtubeUrl || buildSearchFallbackUrl(track),
    true
  );
  setActionLink(dom.openLastfmButton, track.lastFmUrl, true);
}

function syncWebampTransportFromYoutube(targetStatus) {
  if (!state.webamp) {
    return;
  }

  const currentStatus = state.webamp.getMediaStatus();

  if (targetStatus === "PLAYING" && currentStatus !== "PLAYING") {
    state.webamp.play();
  } else if (targetStatus === "PAUSED" && currentStatus === "PLAYING") {
    state.webamp.pause();
  }
}

function handleYoutubeStateChange(event) {
  if (!window.YT?.PlayerState) {
    return;
  }

  const activeMedia = state.activeMedia;
  const webampStatus = state.webamp?.getMediaStatus?.() || null;

  switch (event.data) {
    case window.YT.PlayerState.BUFFERING:
      activeMedia?._emit("waiting");
      ensureTimeupdatePoller();
      setYoutubeStatus("Buffering the selected YouTube stream...");
      break;
    case window.YT.PlayerState.PLAYING:
      activeMedia?._emit("stopWaiting");
      activeMedia?._emit("playing");
      activeMedia?._emit("timeupdate");
      ensureTimeupdatePoller();
      setYoutubeStatus("Playing inside the official YouTube embed.");
      syncWebampTransportFromYoutube("PLAYING");
      break;
    case window.YT.PlayerState.PAUSED:
      activeMedia?._emit("stopWaiting");
      activeMedia?._emit("timeupdate");
      ensureTimeupdatePoller();
      setYoutubeStatus("Paused inside the YouTube embed.");
      syncWebampTransportFromYoutube("PAUSED");
      break;
    case window.YT.PlayerState.ENDED:
      state.lastPlaybackTime = getCurrentYoutubeDuration(state.lastPlaybackTime);
      activeMedia?._emit("stopWaiting");
      activeMedia?._emit("timeupdate");
      stopTimeupdatePoller();
      setYoutubeStatus("YouTube finished the current track.");
      activeMedia?._emit("ended");
      break;
    case window.YT.PlayerState.CUED:
      state.lastPlaybackTime = 0;
      activeMedia?._emit("stopWaiting");
      activeMedia?._emit("timeupdate");
      if (webampStatus === "STOPPED") {
        stopTimeupdatePoller();
        setYoutubeStatus("Transport synced from Webamp: stopped.");
      } else {
        ensureTimeupdatePoller();
        setYoutubeStatus("Track cued in YouTube and waiting for play.");
      }
      break;
    case window.YT.PlayerState.UNSTARTED:
      activeMedia?._emit("timeupdate");
      break;
    default:
      break;
  }
}

function handleYoutubeError(event) {
  stopTimeupdatePoller();
  state.activeMedia?._emit("stopWaiting");
  setYoutubeStatus(`YouTube player error ${event?.data || "unknown"}.`);
  setMatchMeta("Open the matched track directly on YouTube if the embed keeps failing.");
}

function handleYoutubeAutoplayBlocked() {
  state.activeMedia?._emit("stopWaiting");
  setYoutubeStatus(
    "The browser blocked autoplay. Hit play once in the YouTube embed and the transport will stay linked."
  );
}

async function ensureYoutubeApi() {
  if (state.youtubeApiPromise) {
    return state.youtubeApiPromise;
  }

  state.youtubeApiPromise = new Promise((resolve, reject) => {
    if (window.YT?.Player) {
      resolve(window.YT);
      return;
    }

    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previous === "function") {
        previous();
      }
      resolve(window.YT);
    };

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => reject(new Error("Failed to load the YouTube iframe API."));
    document.head.append(script);
  });

  return state.youtubeApiPromise;
}

async function ensureYoutubePlayer() {
  if (state.youtubePlayer && state.youtubePlayerReady) {
    return state.youtubePlayer;
  }

  if (state.youtubePlayerPromise) {
    return state.youtubePlayerPromise;
  }

  state.youtubePlayerPromise = ensureYoutubeApi().then(
    () =>
      new Promise((resolve) => {
        state.youtubePlayer = new window.YT.Player(dom.youtubePlayer, {
          width: "100%",
          height: "260",
          videoId: "",
          playerVars: {
            playsinline: 1,
            rel: 0,
            origin: window.location.origin
          },
          events: {
            onReady(event) {
              state.youtubePlayerReady = true;
              rememberYoutubeVolume(state.pendingVolume);
              resolve(event.target);
            },
            onStateChange: handleYoutubeStateChange,
            onError: handleYoutubeError,
            onAutoplayBlocked: handleYoutubeAutoplayBlocked
          }
        });
      })
  );

  return state.youtubePlayerPromise;
}

async function loadTrackIntoYoutube(track, autoPlay) {
  state.currentTrack = track;
  state.lastPlaybackTime = 0;
  refreshTrackPanel(track);
  setMatchMeta(describeMatch(track));

  if (!track.match?.videoId) {
    state.currentVideoId = null;
    togglePlaceholder(false);
    stopTimeupdatePoller();
    setYoutubeStatus(
      autoPlay
        ? "No clean YouTube match was found for this track."
        : "This track still needs a manual YouTube search."
    );
    return;
  }

  const player = await ensureYoutubePlayer();
  const cueOptions = {
    videoId: track.match.videoId,
    startSeconds: 0
  };

  state.currentVideoId = track.match.videoId;
  togglePlaceholder(true);
  rememberYoutubeVolume(state.pendingVolume);

  if (autoPlay) {
    player.loadVideoById(cueOptions);
    setYoutubeStatus("Loading the selected match into YouTube...");
  } else {
    player.cueVideoById(cueOptions);
    setYoutubeStatus("Cued the selected match in YouTube.");
  }
}

async function playCurrentYoutubeTrack(track = state.currentTrack) {
  if (!track?.match?.videoId) {
    setYoutubeStatus(
      "This track does not have a direct YouTube match yet. Use Open on YouTube to finish it manually."
    );
    return;
  }

  const player = await ensureYoutubePlayer();
  togglePlaceholder(true);
  rememberYoutubeVolume(state.pendingVolume);
  player.playVideo();
  setYoutubeStatus("Transport synced from Webamp: playing.");
}

async function pauseCurrentYoutubeTrack() {
  if (!state.currentTrack?.match?.videoId) {
    return;
  }

  if (!state.youtubePlayerReady) {
    return;
  }

  state.youtubePlayer.pauseVideo();
  setYoutubeStatus("Transport synced from Webamp: paused.");
}

async function stopCurrentYoutubeTrack() {
  state.lastPlaybackTime = 0;
  stopTimeupdatePoller();

  if (!state.currentTrack?.match?.videoId) {
    setYoutubeStatus("Transport synced from Webamp: stopped.");
    return;
  }

  if (!state.youtubePlayerReady) {
    setYoutubeStatus("Transport synced from Webamp: stopped.");
    return;
  }

  state.youtubePlayer.stopVideo();
  setYoutubeStatus("Transport synced from Webamp: stopped.");
}

async function seekCurrentYoutubeTrack(seconds) {
  const safeSeconds = Math.max(0, seconds || 0);
  state.lastPlaybackTime = safeSeconds;

  if (!state.currentTrack?.match?.videoId || !state.youtubePlayerReady) {
    return;
  }

  state.youtubePlayer.seekTo(safeSeconds, true);
  ensureTimeupdatePoller();
  setYoutubeStatus("Transport synced from Webamp: seek applied.");
}

function handleTrackDidChange(trackInfo) {
  if (!trackInfo?.metaData) {
    if (!state.currentTrack) {
      refreshTrackPanel(null);
      togglePlaceholder(false);
      setYoutubeStatus("Nothing is currently selected.");
      setMatchMeta("Search details will appear here.");
    }
    return;
  }

  const identity = `${normalizeText(trackInfo.metaData.artist)}::${normalizeText(
    trackInfo.metaData.title
  )}`;
  const matchedTrack = state.recentTracks.find((track) => track.identity === identity);
  if (!matchedTrack) {
    return;
  }

  state.currentTrack = matchedTrack;
  refreshTrackPanel(matchedTrack);
  setMatchMeta(describeMatch(matchedTrack));

  if (!matchedTrack.match?.videoId) {
    togglePlaceholder(false);
    setYoutubeStatus("No direct YouTube match is ready for this selection.");
  }
}

async function initializeWebamp() {
  if (!window.Webamp?.browserIsSupported?.()) {
    throw new Error("This browser does not support Webamp.");
  }

  state.webamp = new window.Webamp({
    enableHotkeys: true,
    enableMediaSession: true,
    zIndex: 30,
    windowLayout: {
      main: {
        position: { top: 0, left: 0 },
        closed: false
      },
      playlist: {
        position: { top: 0, left: 274 },
        size: { extraWidth: 10, extraHeight: 8 },
        closed: false
      }
    },
    __customMediaClass: YoutubeBackedMedia
  });

  await state.webamp.renderWhenReady(dom.webampStage);
  state.webamp.onTrackDidChange((trackInfo) => {
    handleTrackDidChange(trackInfo);
  });
}

async function appendRecentTracks() {
  setPrimaryStatus("Fetching your recent Last.fm plays...");
  setSecondaryStatus("Once matches resolve, tracks will stream into the Webamp playlist.");
  setPlaylistCount(0, 20);

  state.recentTracks = await fetchRecentTracks();
  state.trackByMediaUrl.clear();
  state.readyTrackCount = 0;
  setPlaylistCount(0, state.recentTracks.length);
  setPrimaryStatus(`Fetched ${state.recentTracks.length} recent tracks from Last.fm.`);
  setSecondaryStatus("Matching each scrobble against YouTube and building a custom-media playlist.");

  await mapWithConcurrency(state.recentTracks, SEARCH_CONCURRENCY, async (track) => {
    const match = await resolveYoutubeMatch(track);
    const durationSeconds = Math.max(
      match?.durationSeconds || DEFAULT_TRACK_DURATION_SECONDS,
      30
    );

    track.match = match;
    track.durationSeconds = durationSeconds;
    track.mediaUrl = createTrackMediaUrl(track);
    state.trackByMediaUrl.set(track.mediaUrl, track);

    const webampTrack = {
      url: track.mediaUrl,
      duration: durationSeconds,
      defaultName: `${track.artist} - ${track.title}`,
      metaData: {
        artist: track.artist,
        title: track.title,
        album: track.album,
        albumArtUrl: track.artworkUrl || undefined
      }
    };

    state.webamp.appendTracks([webampTrack]);
    state.readyTrackCount += 1;
    setPlaylistCount(state.readyTrackCount, state.recentTracks.length);
    setSecondaryStatus(
      `Resolved ${state.readyTrackCount} of ${state.recentTracks.length} scrobbles. ${
        match?.videoId ? "YouTube match found." : "No direct YouTube match; manual search fallback only."
      }`
    );
  });

  setPrimaryStatus("Playlist ready.");
  setSecondaryStatus(
    "Pick a song in Webamp. Play, pause, stop, seek, and scrubbing now drive the YouTube tool window."
  );
}

async function init() {
  setResolverMode();
  dom.reloadButton.addEventListener("click", () => {
    window.location.reload();
  });
  setYoutubeStatus("Ready to load the next match.");
  setMatchMeta("Search details will appear here.");
  togglePlaceholder(false);

  try {
    await initializeWebamp();
    await appendRecentTracks();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unknown startup error occurred.";
    setPrimaryStatus("Mewamp failed to boot cleanly.");
    setSecondaryStatus(message);
    setYoutubeStatus("Startup failed before the player could load.");
    setMatchMeta(message);
  }
}

void init();
