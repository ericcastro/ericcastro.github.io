const asset = (file) => `./assets/${file}`;
const runtimeConfig = window.RETRUCO_RUNTIME_CONFIG ?? {};
const runtimeUrl = new URL(window.location.href);
const widgetFrameMode = runtimeConfig.widgetFrame === true || runtimeUrl.searchParams.get("widget") === "1";

const portraits = {
  patrulla: asset("BITMAP/261.bmp"),
  jugador: asset("BITMAP/303.bmp"),
  monstruo: asset("BITMAP/268.bmp"),
  titan: asset("BITMAP/269.bmp"),
};

const buttons = {
  truco: asset("BITMAP/TRUCOU.bmp"),
  quieroRetruco: asset("BITMAP/QUIERORETRUCOU.bmp"),
  quieroVale4: asset("BITMAP/QUIEROVALE4U.bmp"),
  mazo: asset("BITMAP/MEVOYALMAZOU.bmp"),
  paso: asset("BITMAP/PASARU.bmp"),
  sonBuenas: asset("BITMAP/SONBUENASU.bmp"),
  newGame: asset("BITMAP/NEWGAMEU.bmp"),
  next: asset("BITMAP/NEXTU.bmp"),
  quiero: asset("BITMAP/QUIEROU.bmp"),
  noQuiero: asset("BITMAP/NOQUIEROU.bmp"),
  envido: asset("BITMAP/ENVIDOU.bmp"),
  realEnvido: asset("BITMAP/REALENVIDOU.bmp"),
  faltaEnvido: asset("BITMAP/FALTAENVIDOU.bmp"),
};

const cpuCharacters = ["patrulla", "monstruo", "titan"];
const seatOrder = ["patrulla", "jugador", "monstruo", "titan"];
const playerLabels = {
  jugador: "JUGADOR",
  patrulla: "PATRULLA",
  monstruo: "MONSTRUO",
  titan: "TITAN",
};
const accentClasses = ["accent-green", "accent-red", "accent-gold"];
const teamAccentClasses = {
  teamOne: "accent-red",
  teamTwo: "accent-gold",
};

const slotNodes = {
  patrulla: {
    portrait: document.getElementById("portrait-patrulla"),
    speech: document.getElementById("speech-patrulla"),
    nameplate: document.querySelector(".slot-patrulla .nameplate"),
    stack: document.getElementById("played-patrulla"),
  },
  jugador: {
    portrait: document.getElementById("portrait-jugador"),
    speech: document.getElementById("speech-jugador"),
    nameplate: document.querySelector(".slot-jugador .nameplate"),
    stack: document.getElementById("played-player"),
  },
  monstruo: {
    portrait: document.getElementById("portrait-monstruo"),
    speech: document.getElementById("speech-monstruo"),
    nameplate: document.querySelector(".slot-monstruo .nameplate"),
    stack: document.getElementById("played-monstruo"),
  },
  titan: {
    portrait: document.getElementById("portrait-titan"),
    speech: document.getElementById("speech-titan"),
    nameplate: document.querySelector(".slot-titan .nameplate"),
    stack: document.getElementById("played-titan"),
  },
};

const fallbackVoiceSequences = {
  actions: {
    envido: { soundIds: ["113"] },
    realEnvido: { soundIds: ["116"] },
    faltaEnvido: { soundIds: ["119"] },
    truco: { soundIds: ["123"] },
    quieroRetruco: { soundIds: ["127"] },
    quieroVale4: { soundIds: ["131"] },
    quiero: { soundIds: ["135"] },
    noQuiero: { soundIds: ["139"] },
    meVoyAlMazo: { soundIds: ["142"] },
    sonBuenas: { soundIds: ["144"] },
    paso: { soundIds: ["204"] },
  },
  phrases: {
    yoTengo: { soundIds: ["180"] },
    queTenes: { soundIds: ["193"] },
    tenes: { soundIds: ["178"] },
    veinte: { soundIds: ["174"] },
    veintiY: { soundIds: ["178"] },
    treinta: { soundIds: ["176"] },
    treintaY: { soundIds: ["196"] },
  },
  banter: {
    winner: { text: "GANAMOS NOMAS", soundIds: ["328", "331"] },
    randomBoasts: [
      { text: "VAN A PERDER", soundIds: ["330"] },
      { text: "LES VAMOS A LLENAR LA CANASTA", soundIds: ["329"] },
    ],
    rematchPrompts: [
      { text: "AH, REVANCHA?", soundIds: ["332"] },
      { text: "JUGAMOS DE NUEVO?", soundIds: ["333"] },
    ],
    startEffect: { text: "START_FROG", soundIds: ["343"] },
    idleTauntOpeners: [
      { text: "QUE ESTAS ESPERANDO", soundIds: ["326"] },
      { text: "NO TENGO TODO EL DIA", soundIds: ["327"] },
    ],
    idleTauntClosers: [
      { text: "GILAZO", soundIds: ["324"] },
      { text: "INUTIL", soundIds: ["325"] },
    ],
  },
  cardPlay: {
    baseSoundId: "191",
    rankSoundIdsByVisibleRank: {
      "1": "150",
      "2": "152",
      "3": "154",
      "4": "156",
      "5": "158",
      "6": "160",
      "7": "162",
      "10": "168",
      "11": "170",
      "12": "172",
    },
    suitSoundIds: {
      espadas: "183",
      copas: "185",
      bastos: "187",
      oros: "189",
    },
  },
};

const recoveredDeck = [
  117, 124, 128, 136, 140, 143, 145, 151, 155, 161,
  163, 165, 167, 171, 173, 175, 177, 179, 181, 184,
  186, 188, 190, 192, 194, 197, 199, 201, 203, 205,
  210, 214, 216, 218, 220, 222, 224, 226, 228, 230,
];

const TURN_ANNOUNCE_DELAY_MS = 360;
const CPU_PLAY_DELAY_MS = 900;
const NEXT_TURN_DELAY_MS = 720;
const TRICK_RESOLVE_DELAY_MS = 960;
const NEXT_TRICK_DELAY_MS = 1100;
const ENVIDO_REVEAL_DELAY_MS = 1050;
const ENVIDO_USER_PASS_DELAY_MS = 2200;
const RANDOM_BANTER_DELAY_MS = 900;
const IDLE_BANTER_MIN_MS = 7000;
const IDLE_BANTER_MAX_MS = 12000;
const AUDIO_SETTINGS_KEY = "retruco-audio-settings-v1";
const MUSIC_VOLUME_MAX = 0.18;

const splashScreen = document.getElementById("splash-screen");
const tableScreen = document.getElementById("table-screen");

const overlays = {
  partner: document.getElementById("partner-overlay"),
  about: document.getElementById("about-overlay"),
  inspector: document.getElementById("inspector-overlay"),
};

const manifestFields = {
  bitmaps: document.getElementById("manifest-bitmaps"),
  sounds: document.getElementById("manifest-sounds"),
  midi: document.getElementById("manifest-midi"),
  wav: document.getElementById("manifest-wav"),
};

const bitmapPicker = document.getElementById("bitmap-picker");
const bitmapPreview = document.getElementById("bitmap-preview");
const bitmapNote = document.getElementById("bitmap-note");
const soundPicker = document.getElementById("sound-picker");
const audioNote = document.getElementById("audio-note");
const handSummary = document.getElementById("hand-summary");
const handCards = document.getElementById("hand-cards");
const profileList = document.getElementById("profile-list");
const callList = document.getElementById("call-list");
const rulesList = document.getElementById("rules-list");
const scoreTeamOne = document.getElementById("score-team-one");
const scoreTeamTwo = document.getElementById("score-team-two");
const scoreTallyTeamOne = document.getElementById("score-tally-team-one");
const scoreTallyTeamTwo = document.getElementById("score-tally-team-two");
const teamOneMembers = document.getElementById("team-one-members");
const teamTwoMembers = document.getElementById("team-two-members");
const seedInput = document.getElementById("seed-input");
const seedCurrent = document.getElementById("seed-current");
const seedHand = document.getElementById("seed-hand");
const musicMuteInput = document.getElementById("music-mute");
const musicVolumeInput = document.getElementById("music-volume");
const musicVolumeValue = document.getElementById("music-volume-value");
const voiceMuteInput = document.getElementById("voice-mute");
const voiceVolumeInput = document.getElementById("voice-volume");
const voiceVolumeValue = document.getElementById("voice-volume-value");
const helpLinks = {
  cards: document.getElementById("help-link-cards"),
  resources: document.getElementById("help-link-resources"),
};
const actionButtons = {
  truco: document.getElementById("btn-truco"),
  mazo: document.getElementById("btn-mazo"),
  paso: document.getElementById("btn-paso"),
  newGame: document.getElementById("btn-new-game"),
  next: document.getElementById("btn-next"),
  quiero: document.getElementById("btn-quiero"),
  noQuiero: document.getElementById("btn-no-quiero"),
  envido: document.getElementById("btn-envido"),
  realEnvido: document.getElementById("btn-real-envido"),
  faltaEnvido: document.getElementById("btn-falta-envido"),
};
const effectPlayer = new Audio();
const midiPlayer = new Audio();
const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
const wavBufferCache = new Map();

let wavAudioContext = null;
let wavGainNode = null;
let activeWavSource = null;
let activeSpeechToken = 0;
let audioUnlockAttempted = false;
let audioUnlocked = false;
let liveReloadSource = null;
let banterTimerId = null;
let randomBanterCooldownUntil = 0;
let backgroundMidiSynth = null;
let backgroundMidiLoadPromise = null;
let backgroundMidiFilename = "";
let backgroundMidiStarted = false;
let manifestLoadPromise = null;

const audioSettings = loadAudioSettings();

const state = {
  partner: "patrulla",
  hand: [128, 199, 218],
  manifest: null,
  match: {
    handNumber: 0,
    manoIndex: 0,
    manoPlayer: "jugador",
    lastRoundWinner: null,
    seed: "",
    scores: {
      teamOne: 0,
      teamTwo: 0,
    },
  },
  round: null,
  seating: {
    slotToPlayer: {
      patrulla: "titan",
      jugador: "jugador",
      monstruo: "monstruo",
      titan: "patrulla",
    },
    playerToSlot: {
      jugador: "jugador",
      patrulla: "titan",
      monstruo: "monstruo",
      titan: "patrulla",
    },
  },
  tableCards: {
    patrulla: [],
    titan: [],
    monstruo: [],
    jugador: [],
  },
};

function xmur3(seed) {
  let hash = 1779033703 ^ seed.length;

  for (let index = 0; index < seed.length; index += 1) {
    hash = Math.imul(hash ^ seed.charCodeAt(index), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }

  return () => {
    hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
    hash ^= hash >>> 16;
    return hash >>> 0;
  };
}

function mulberry32(seed) {
  return () => {
    let value = seed += 0x6d2b79f5;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function createSeededRandom(seed) {
  return mulberry32(xmur3(seed)());
}

function shuffle(values, random = Math.random) {
  const next = [...values];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

function normalizeSeed(seed) {
  return String(seed ?? "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 64);
}

function createRandomSeed() {
  if (window.crypto?.getRandomValues) {
    const values = new Uint32Array(2);
    window.crypto.getRandomValues(values);
    return `${values[0].toString(16)}-${values[1].toString(16)}`;
  }

  return `seed-${Date.now().toString(36)}`;
}

function syncSeedToUrl(seed) {
  const url = new URL(window.location.href);
  url.searchParams.set("seed", seed);
  window.history.replaceState({}, "", url);
}

function getDealSeed(handNumber) {
  return `${state.match.seed}:mano-${handNumber}`;
}

function renderSeedPanel() {
  if (seedInput.value !== state.match.seed) {
    seedInput.value = state.match.seed;
  }

  seedCurrent.textContent = `Seed base: ${state.match.seed || "-"}`;

  const nextHandNumber = state.round ? state.match.handNumber : state.match.handNumber + 1;
  const label = state.round
    ? `Mano ${state.match.handNumber}: ${state.round.dealSeed}`
    : `Proxima mano: ${getDealSeed(nextHandNumber)}`;

  seedHand.textContent = label;
}

function setMatchSeed(seed) {
  const normalized = normalizeSeed(seed) || createRandomSeed();
  state.match.seed = normalized;
  syncSeedToUrl(normalized);
  renderSeedPanel();
}

function initializeSeed() {
  const seedFromUrl = new URL(window.location.href).searchParams.get("seed");
  setMatchSeed(seedFromUrl || createRandomSeed());
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function loadAudioSettings() {
  const defaults = {
    musicMuted: false,
    musicVolume: 56,
    voiceMuted: false,
    voiceVolume: 100,
  };

  try {
    const stored = JSON.parse(window.localStorage?.getItem(AUDIO_SETTINGS_KEY) ?? "null");
    return {
      musicMuted: Boolean(stored?.musicMuted),
      musicVolume: clamp(Number(stored?.musicVolume ?? defaults.musicVolume), 0, 100),
      voiceMuted: Boolean(stored?.voiceMuted),
      voiceVolume: clamp(Number(stored?.voiceVolume ?? defaults.voiceVolume), 0, 100),
    };
  } catch (error) {
    console.warn("Could not load persisted audio settings.", error);
    return defaults;
  }
}

function saveAudioSettings() {
  try {
    window.localStorage?.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(audioSettings));
  } catch (error) {
    console.warn("Could not persist audio settings.", error);
  }
}

function setSelectPlaceholder(node, label) {
  const option = document.createElement("option");
  option.value = "";
  option.textContent = label;
  node.replaceChildren(option);
}

function closeMenus() {
  document.querySelectorAll(".menu-panel").forEach((panel) => {
    panel.classList.add("is-hidden");
  });
}

function callText(key, fallback) {
  return state.manifest?.callLexicon?.[key] ?? fallback;
}

function getVoiceSequences() {
  const manifestVoice = state.manifest?.voiceSequences ?? {};
  return {
    ...fallbackVoiceSequences,
    ...manifestVoice,
    actions: {
      ...fallbackVoiceSequences.actions,
      ...manifestVoice.actions,
    },
    phrases: {
      ...fallbackVoiceSequences.phrases,
      ...manifestVoice.phrases,
    },
    cardPlay: {
      ...fallbackVoiceSequences.cardPlay,
      ...manifestVoice.cardPlay,
      rankSoundIdsByVisibleRank: {
        ...fallbackVoiceSequences.cardPlay.rankSoundIdsByVisibleRank,
        ...manifestVoice.cardPlay?.rankSoundIdsByVisibleRank,
      },
      suitSoundIds: {
        ...fallbackVoiceSequences.cardPlay.suitSoundIds,
        ...manifestVoice.cardPlay?.suitSoundIds,
      },
    },
  };
}

function getCardCatalog() {
  return state.manifest?.cardCatalog ?? [];
}

function getCardEntry(bitmapId) {
  return getCardCatalog().find((card) => card.bitmap === `${bitmapId}.bmp`) ?? null;
}

function getPlayableDeck() {
  const playableDeck = state.manifest?.playableDeck?.map((file) => Number(file.replace(".bmp", "")));
  return playableDeck?.length ? playableDeck : recoveredDeck;
}

function getOpponents() {
  return cpuCharacters.filter((player) => player !== state.partner);
}

function getPlayerLabel(player) {
  return playerLabels[player] ?? player.toUpperCase();
}

function getActionVoiceSequence(key) {
  return getVoiceSequences().actions?.[key]?.soundIds ?? [];
}

function getPhraseVoiceSequence(key) {
  return getVoiceSequences().phrases?.[key]?.soundIds ?? [];
}

function getBanterSequences() {
  return getVoiceSequences().banter ?? fallbackVoiceSequences.banter;
}

function clearBanterTimer() {
  if (!banterTimerId) {
    return;
  }

  window.clearTimeout(banterTimerId);
  banterTimerId = null;
}

function sample(items) {
  if (!items?.length) {
    return null;
  }

  return items[Math.floor(Math.random() * items.length)] ?? null;
}

function buildIdleTauntSequence() {
  const banter = getBanterSequences();
  const opener = sample(banter.idleTauntOpeners ?? []);
  const closer = sample(banter.idleTauntClosers ?? []);

  if (opener && closer) {
    return {
      text: `${opener.text}, ${closer.text}`,
      soundIds: [...(opener.soundIds ?? []), ...(closer.soundIds ?? [])],
    };
  }

  return sample(banter.idleTaunts ?? []);
}

function scheduleIdleBanter() {
  clearBanterTimer();

  if (!state.round || state.round.roundOver || isSequenceLocked() || state.round.pendingCall && !getUserControlledResponder()) {
    return;
  }

  const waitingForUser = isUserTurn() || Boolean(getUserControlledResponder());
  if (!waitingForUser) {
    return;
  }

  const delay = IDLE_BANTER_MIN_MS + Math.floor(Math.random() * (IDLE_BANTER_MAX_MS - IDLE_BANTER_MIN_MS));
  banterTimerId = window.setTimeout(() => {
    banterTimerId = null;
    if (!state.round || state.round.roundOver || isSequenceLocked()) {
      return;
    }

    if (!(isUserTurn() || Boolean(getUserControlledResponder()))) {
      return;
    }

    const taunt = buildIdleTauntSequence();
    const speakerPool = getOpponents();
    const speaker = sample(speakerPool) ?? getOpponents()[0];
    if (!taunt || !speaker) {
      return;
    }

    announcePlayerLine(speaker, taunt.text, taunt.soundIds);
    scheduleIdleBanter();
  }, delay);
}

function maybeScheduleRandomBanter(speaker, onComplete) {
  const sequences = getBanterSequences().randomBoasts ?? [];
  if (!speaker || !sequences.length || Date.now() < randomBanterCooldownUntil || Math.random() >= 0.16) {
    return false;
  }

  const line = sample(sequences);
  if (!line) {
    return false;
  }

  randomBanterCooldownUntil = Date.now() + 12000;
  announcePlayerLine(speaker, line.text, line.soundIds);
  scheduleRoundStep(onComplete, RANDOM_BANTER_DELAY_MS);
  return true;
}

function getRankVoiceId(rank) {
  return getVoiceSequences().cardPlay?.rankSoundIdsByVisibleRank?.[String(rank)] ?? null;
}

function getSpokenNumberVoiceSequence(value) {
  const score = Number(value);
  if (!Number.isInteger(score) || score < 0 || score > 33) {
    return [];
  }

  if (score === 0) {
    return ["147"];
  }

  if (score >= 1 && score <= 7) {
    return [getRankVoiceId(score)].filter(Boolean);
  }

  if (score >= 10 && score <= 12) {
    return [getRankVoiceId(score)].filter(Boolean);
  }

  if (score === 20) {
    return getPhraseVoiceSequence("veinte");
  }

  if (score >= 20 && score <= 27) {
    const unit = score - 20;
    return [...getPhraseVoiceSequence("veintiY"), ...(unit > 0 ? [getRankVoiceId(unit)] : [])].filter(Boolean);
  }

  if (score === 30) {
    return getPhraseVoiceSequence("treinta");
  }

  if (score >= 30 && score <= 33) {
    const unit = score - 30;
    return [...getPhraseVoiceSequence("treintaY"), ...(unit > 0 ? [getRankVoiceId(unit)] : [])].filter(Boolean);
  }

  return [];
}

function getCardVoiceSequence(bitmapId) {
  const card = getCardEntry(bitmapId);
  if (!card) {
    return [];
  }

  const voice = getVoiceSequences().cardPlay ?? fallbackVoiceSequences.cardPlay;
  const baseSoundId = voice.baseSoundId;
  const rankSoundId = voice.rankSoundIdsByVisibleRank?.[String(card.rank)] ?? null;
  const suitSoundId = voice.suitSoundIds?.[card.suit];
  return [baseSoundId, rankSoundId, suitSoundId].filter(Boolean);
}

function getTeamForPlayer(player) {
  return player === "jugador" || player === state.partner ? "teamOne" : "teamTwo";
}

function getOpposingTeam(team) {
  return team === "teamOne" ? "teamTwo" : "teamOne";
}

function buildSeating(turnOrder) {
  const [, nearOpponent, partner, farOpponent] = turnOrder;
  return {
    slotToPlayer: {
      patrulla: farOpponent,
      jugador: "jugador",
      monstruo: nearOpponent,
      titan: partner,
    },
    playerToSlot: {
      jugador: "jugador",
      [nearOpponent]: "monstruo",
      [partner]: "titan",
      [farOpponent]: "patrulla",
    },
  };
}

function updateSeating(turnOrder = buildTurnOrder()) {
  state.seating = buildSeating(turnOrder);
}

function getSlotForPlayer(player) {
  return state.seating.playerToSlot[player] ?? "jugador";
}

function getPlayerAtSlot(slot) {
  return state.seating.slotToPlayer[slot] ?? "jugador";
}

function getTeamMembers(team) {
  const opponents = getOpponents();
  if (team === "teamOne") {
    return ["jugador", state.partner];
  }

  return opponents;
}

function buildTurnOrder() {
  const [nearOpponent, farOpponent] = getOpponents();
  return ["jugador", nearOpponent, state.partner, farOpponent];
}

function getTurnIndex(player, round = state.round) {
  return round?.turnOrder?.indexOf(player) ?? -1;
}

function getNextSeat(player, round = state.round) {
  const playerIndex = getTurnIndex(player, round);
  if (!round?.turnOrder?.length || playerIndex < 0) {
    return null;
  }

  return round.turnOrder[(playerIndex + 1) % round.turnOrder.length];
}

function getCurrentPlayer() {
  return state.round?.turnOrder?.[state.round.currentTurnIndex] ?? null;
}

function isUserTurn() {
  return Boolean(state.round && !state.round.roundOver && getCurrentPlayer() === "jugador");
}

function getPlayersInManoOrder(round = state.round) {
  if (!round?.turnOrder?.length) {
    return [];
  }

  const starterIndex = getTurnIndex(round.handStarter, round);
  if (starterIndex < 0) {
    return [...round.turnOrder];
  }

  return [
    ...round.turnOrder.slice(starterIndex),
    ...round.turnOrder.slice(0, starterIndex),
  ];
}

function getTrickTurnPosition(player, round = state.round) {
  if (!round?.turnOrder?.length) {
    return -1;
  }

  const starterIndex = getTurnIndex(round.trickStarter, round);
  const playerIndex = getTurnIndex(player, round);
  if (starterIndex < 0 || playerIndex < 0) {
    return -1;
  }

  return (playerIndex - starterIndex + round.turnOrder.length) % round.turnOrder.length;
}

function canPlayerCallEnvidoNow(player = "jugador") {
  if (!state.round || state.round.roundOver || state.round.trickIndex !== 0) {
    return false;
  }

  if (state.round.trickPlays.some((play) => play.player === player)) {
    return false;
  }

  return getTrickTurnPosition(player) >= 2;
}

function getNextOpponent(player, round = state.round) {
  if (!round?.turnOrder?.length) {
    return null;
  }

  const playerTeam = getTeamForPlayer(player);
  let nextPlayer = player;
  for (let step = 0; step < round.turnOrder.length; step += 1) {
    nextPlayer = getNextSeat(nextPlayer, round);
    if (nextPlayer && getTeamForPlayer(nextPlayer) !== playerTeam) {
      return nextPlayer;
    }
  }

  return null;
}

function getPlayerHand(player) {
  return state.round?.hands?.[player] ?? [];
}

function getPlayerEnvidoHand(player) {
  return state.round?.initialHands?.[player] ?? getPlayerHand(player);
}

function setPlayerHand(player, nextHand) {
  if (!state.round) {
    return;
  }

  state.round.hands[player] = nextHand;
  if (player === "jugador") {
    state.hand = nextHand;
  }
}

function getVoiceGainValue() {
  return audioSettings.voiceMuted ? 0 : audioSettings.voiceVolume / 100;
}

function getMusicGainValue() {
  return audioSettings.musicMuted ? 0 : (audioSettings.musicVolume / 100) * MUSIC_VOLUME_MAX;
}

function applyVoiceAudioSettings() {
  if (wavGainNode) {
    wavGainNode.gain.value = getVoiceGainValue();
  }

  effectPlayer.volume = getVoiceGainValue();
}

function applyMusicAudioSettings() {
  midiPlayer.volume = getMusicGainValue();
  if (backgroundMidiSynth) {
    backgroundMidiSynth.setMasterVol?.(getMusicGainValue());
  }
}

function renderAudioControls() {
  if (musicMuteInput) {
    musicMuteInput.checked = audioSettings.musicMuted;
  }
  if (musicVolumeInput) {
    musicVolumeInput.value = String(audioSettings.musicVolume);
  }
  if (musicVolumeValue) {
    musicVolumeValue.value = `${audioSettings.musicVolume}%`;
    musicVolumeValue.textContent = `${audioSettings.musicVolume}%`;
  }
  if (voiceMuteInput) {
    voiceMuteInput.checked = audioSettings.voiceMuted;
  }
  if (voiceVolumeInput) {
    voiceVolumeInput.value = String(audioSettings.voiceVolume);
  }
  if (voiceVolumeValue) {
    voiceVolumeValue.value = `${audioSettings.voiceVolume}%`;
    voiceVolumeValue.textContent = `${audioSettings.voiceVolume}%`;
  }
}

function clearTableCards() {
  state.tableCards = {
    patrulla: [],
    titan: [],
    monstruo: [],
    jugador: [],
  };
}

function clearRoundTimer(round = state.round) {
  if (!round?.timerId) {
    return;
  }

  window.clearTimeout(round.timerId);
  round.timerId = null;
}

function scheduleRoundStep(callback, delay, round = state.round) {
  if (!round || round.roundOver) {
    return;
  }

  clearRoundTimer(round);
  round.timerId = window.setTimeout(() => {
    if (state.round !== round || round.roundOver) {
      return;
    }

    round.timerId = null;
    callback();
  }, delay);
}

function renderMatchScore() {
  scoreTeamOne.textContent = String(state.match.scores.teamOne);
  scoreTeamTwo.textContent = String(state.match.scores.teamTwo);
  teamOneMembers.textContent = getTeamMembers("teamOne").map(getPlayerLabel).join(" + ");
  teamTwoMembers.textContent = getTeamMembers("teamTwo").map(getPlayerLabel).join(" + ");
  renderScoreTally(scoreTallyTeamOne, state.match.scores.teamOne);
  renderScoreTally(scoreTallyTeamTwo, state.match.scores.teamTwo);
}

function renderScoreTally(node, score) {
  if (!node) {
    return;
  }

  const svgNs = "http://www.w3.org/2000/svg";
  const cappedScore = Math.max(0, Math.min(15, Number(score) || 0));
  node.replaceChildren();

  const strokeSegments = [
    { x1: 4, y1: 4, x2: 16, y2: 4 },
    { x1: 16, y1: 4, x2: 16, y2: 18 },
    { x1: 16, y1: 18, x2: 4, y2: 18 },
    { x1: 4, y1: 18, x2: 4, y2: 4 },
    { x1: 4, y1: 4, x2: 16, y2: 18 },
  ];

  for (let groupIndex = 0; groupIndex < 3; groupIndex += 1) {
    const groupScore = Math.max(0, Math.min(5, cappedScore - (groupIndex * 5)));
    const offsetY = groupIndex * 36;

    for (let strokeIndex = 0; strokeIndex < groupScore; strokeIndex += 1) {
      const segment = strokeSegments[strokeIndex];
      const line = document.createElementNS(svgNs, "line");
      line.setAttribute("x1", String(segment.x1));
      line.setAttribute("y1", String(segment.y1 + offsetY));
      line.setAttribute("x2", String(segment.x2));
      line.setAttribute("y2", String(segment.y2 + offsetY));
      line.setAttribute("stroke", "#2953ff");
      line.setAttribute("stroke-width", "1");
      line.setAttribute("shape-rendering", "crispEdges");
      node.append(line);
    }
  }
}

function updateCallout(message) {
  document.getElementById("callout-box").textContent = message;
}

function clearSpeechLines() {
  Object.values(slotNodes).forEach((slot) => {
    slot.speech.textContent = "";
  });
}

function setSpeechLine(player, message) {
  const slot = slotNodes[getSlotForPlayer(player)];
  if (!slot) {
    return;
  }

  slot.speech.textContent = message;
}

function announcePlayerLine(player, message, voiceSequence = []) {
  clearSpeechLines();
  setSpeechLine(player, message);
  updateCallout(`${getPlayerLabel(player)}: ${message}`);
  if (voiceSequence.length) {
    playRecoveredSpeechSequence(voiceSequence);
  }
}

function getAudioAssetUrl(filename) {
  if (filename.endsWith(".wav")) {
    return asset(`audio-browser/${filename}`);
  }

  return asset(`audio/${filename}`);
}

function getTurnPrompt(player) {
  if (player === "jugador") {
    return state.round?.trickPlays.length === 0 ? "SALE JUGADOR" : "TE TOCA JUGAR";
  }

  return state.round?.trickPlays.length === 0
    ? `SALE ${getPlayerLabel(player)}`
    : `JUEGA ${getPlayerLabel(player)}`;
}

function setScreen(screen) {
  if (screen === "splash") {
    splashScreen.classList.remove("is-hidden");
    tableScreen.classList.add("is-hidden");
    return;
  }

  splashScreen.classList.add("is-hidden");
  tableScreen.classList.remove("is-hidden");
}

function showOverlay(name) {
  const overlay = overlays[name];
  if (!overlay) {
    return;
  }

  overlay.classList.remove("is-hidden");
  overlay.setAttribute("aria-hidden", "false");
}

function hideOverlay(name) {
  const overlay = overlays[name];
  if (!overlay) {
    return;
  }

  overlay.classList.add("is-hidden");
  overlay.setAttribute("aria-hidden", "true");
}

function hideAllOverlays() {
  Object.keys(overlays).forEach(hideOverlay);
}

function setTableCardForPlayer(player, bitmapIds) {
  const slot = slotNodes[getSlotForPlayer(player)];
  if (!slot) {
    return;
  }

  const node = slot.stack;
  node.replaceChildren();
  if (!bitmapIds?.length) {
    return;
  }

  node.replaceChildren(
    ...bitmapIds.map((bitmapId, index) => {
      const image = document.createElement("img");
      image.className = "table-stack-card";
      image.src = asset(`BITMAP/${bitmapId}.bmp`);
      image.alt = `Recovered table card ${bitmapId}`;
      image.title = describeBitmap(`${bitmapId}.bmp`);
      image.style.bottom = `${index * 24}px`;
      image.style.zIndex = String(index + 1);
      return image;
    }),
  );
}

function renderTableCards() {
  Object.values(slotNodes).forEach((slot) => {
    slot.stack.replaceChildren();
  });

  setTableCardForPlayer("patrulla", state.tableCards.patrulla);
  setTableCardForPlayer("titan", state.tableCards.titan);
  setTableCardForPlayer("monstruo", state.tableCards.monstruo);
  setTableCardForPlayer("jugador", state.tableCards.jugador);
}

function renderPortraits() {
  Object.entries(slotNodes).forEach(([slotKey, slot]) => {
    const player = getPlayerAtSlot(slotKey);
    slot.portrait.src = portraits[player];
    slot.portrait.alt = `${getPlayerLabel(player)} portrait`;
    slot.nameplate.textContent = getPlayerLabel(player);
    accentClasses.forEach((className) => {
      slot.nameplate.classList.remove(className);
    });
    slot.nameplate.classList.add(teamAccentClasses[getTeamForPlayer(player)] ?? "accent-gold");
  });

  document.getElementById("dialog-jugador").src = portraits.jugador;
}

function renderButtons() {
  renderTrucoButton();
  document.querySelector("#btn-mazo img").src = buttons.mazo;
  document.querySelector("#btn-paso img").src = buttons.paso;
  document.querySelector("#btn-new-game img").src = buttons.newGame;
  document.querySelector("#btn-next img").src = buttons.next;
  document.querySelector("#btn-quiero img").src = buttons.quiero;
  document.querySelector("#btn-no-quiero img").src = buttons.noQuiero;
  document.querySelector("#btn-envido img").src = buttons.envido;
  document.querySelector("#btn-real-envido img").src = buttons.realEnvido;
  document.querySelector("#btn-falta-envido img").src = buttons.faltaEnvido;
  renderActionButtons();
}

function renderPartnerDialog() {
  const options = [
    { id: "patrulla", label: "PATRULLA", portrait: portraits.patrulla },
    { id: "titan", label: "TITAN", portrait: portraits.titan },
    { id: "monstruo", label: "MONSTRUO", portrait: portraits.monstruo },
  ];

  const container = document.getElementById("partner-options");
  container.replaceChildren(
    ...options.map((option) => {
      const button = document.createElement("button");
      button.className = "partner-choice";
      button.type = "button";
      button.addEventListener("click", () => {
        void ensureBackgroundMusicStarted();
        state.partner = option.id;
        updateSeating();
        renderPortraits();
        hideOverlay("partner");
        setScreen("table");
        renderMatchScore();
        updateCallout(`JUGAS CON ${option.label}`);
        if (state.manifest) {
          newMatch();
        }
      });

      const label = document.createElement("span");
      label.textContent = option.label;

      const image = document.createElement("img");
      image.className = "portrait";
      image.src = option.portrait;
      image.alt = `${option.label} portrait`;

      button.append(label, image);
      return button;
    }),
  );
}

function describeBitmap(file) {
  const card = getCardCatalog().find((entry) => entry.bitmap === file);
  if (card) {
    return card.notes ? `${card.label}. ${card.notes}` : card.label;
  }

  return state.manifest?.knownBitmaps?.[file] ?? `Recovered bitmap resource ${file}`;
}

function formatPlayedCardCall(bitmapId) {
  const card = getCardEntry(bitmapId);
  if (!card) {
    return `TIRO RECURSO ${bitmapId}`;
  }
  return `${callText("tiroEl", "TIRO EL")} ${card.rank} ${callText("de", "DE")} ${card.suit.toUpperCase()}`;
}

function computeEnvidoScore(bitmapIds) {
  const cards = bitmapIds.map(getCardEntry).filter(Boolean);
  if (!cards.length) {
    return null;
  }

  const bySuit = new Map();
  cards.forEach((card) => {
    if (!bySuit.has(card.suit)) {
      bySuit.set(card.suit, []);
    }
    bySuit.get(card.suit).push(card.envidoScore);
  });

  const suitedScores = [...bySuit.values()]
    .filter((values) => values.length >= 2)
    .map((values) => values.sort((left, right) => right - left).slice(0, 2).reduce((sum, value) => sum + value, 20));

  if (suitedScores.length) {
    return Math.max(...suitedScores);
  }

  return Math.max(...cards.map((card) => card.envidoScore));
}

function getBestTrucoCard(bitmapIds) {
  const cards = bitmapIds.map(getCardEntry).filter(Boolean);
  if (!cards.length) {
    return null;
  }

  return cards.reduce((best, current) => {
    if (!best) {
      return current;
    }

    return current.trucoStrength > best.trucoStrength ? current : best;
  }, null);
}

function renderHandAnalysis() {
  const cards = state.hand.map(getCardEntry).filter(Boolean);
  handCards.replaceChildren(
    ...cards.map((card) => {
      const item = document.createElement("li");
      item.textContent = `${card.label} | envido ${card.envidoScore} | fuerza ${card.trucoStrength}`;
      return item;
    }),
  );

  if (!cards.length) {
    handSummary.textContent = "Recovered hand analysis will appear here.";
    return;
  }

  const envido = computeEnvidoScore(state.hand);
  const bestCard = getBestTrucoCard(state.hand);
  handSummary.textContent = `Envido ${envido}. Mejor carta de truco: ${bestCard?.label ?? "desconocida"}.`;
}

function formatPlayerCardCall(player, bitmapId) {
  return `${getPlayerLabel(player)}: ${formatPlayedCardCall(bitmapId)}`;
}

function getCurrentTrickState(plays = state.round?.trickPlays ?? []) {
  if (!plays.length) {
    return null;
  }

  const strongestStrength = Math.max(...plays.map((play) => play.card.trucoStrength));
  const strongestPlays = plays.filter((play) => play.card.trucoStrength === strongestStrength);
  const strongestTeams = new Set(strongestPlays.map((play) => getTeamForPlayer(play.player)));

  if (strongestTeams.size === 1) {
    return {
      type: "lead",
      strength: strongestStrength,
      team: getTeamForPlayer(strongestPlays[0].player),
      player: strongestPlays[0].player,
      plays: strongestPlays,
    };
  }

  return {
    type: "tie",
    strength: strongestStrength,
    team: null,
    player: null,
    plays: strongestPlays,
  };
}

function chooseCpuCard(player) {
  const hand = getPlayerHand(player).map((bitmapId) => ({
    bitmapId,
    card: getCardEntry(bitmapId),
  }));

  const sorted = hand.sort((left, right) => left.card.trucoStrength - right.card.trucoStrength);
  const currentTrick = getCurrentTrickState();
  if (!currentTrick) {
    return sorted[0]?.bitmapId ?? null;
  }

  if (currentTrick.type === "lead" && currentTrick.team === getTeamForPlayer(player)) {
    return sorted[0]?.bitmapId ?? null;
  }

  return sorted.find((entry) => entry.card.trucoStrength > currentTrick.strength)?.bitmapId ?? sorted[0]?.bitmapId ?? null;
}

function countWonTricks() {
  return (state.round?.trickResults ?? []).reduce((accumulator, result) => {
    if (result.winnerTeam) {
      accumulator[result.winnerTeam] += 1;
    }
    return accumulator;
  }, { teamOne: 0, teamTwo: 0 });
}

function isMatchOver() {
  const matchTarget = state.manifest?.rules?.matchPoints ?? 15;
  return state.match.scores.teamOne >= matchTarget || state.match.scores.teamTwo >= matchTarget;
}

function isSequenceLocked() {
  return Boolean(state.round?.sequenceLock);
}

function canUserRespondToPendingCall() {
  return Boolean(getUserControlledResponder());
}

function getUserControlledResponder() {
  const responder = state.round?.pendingCall?.responder ?? null;
  if (responder === "jugador" || responder === state.partner) {
    return responder;
  }

  return null;
}

function canStartEnvido(player = "jugador") {
  if (!state.round || state.round.roundOver || state.round.pendingCall || state.round.envidoResolved || isSequenceLocked()) {
    return false;
  }

  if (state.round.trucoStake > 1) {
    return false;
  }

  return canPlayerCallEnvidoNow(player);
}

function canTeamCallEnvidoNow(team) {
  return getTeamMembers(team).some((member) => canPlayerCallEnvidoNow(member));
}

function canInterruptTrucoWithEnvido(player = "jugador") {
  if (!state.round || state.round.roundOver || state.round.envidoResolved || isSequenceLocked()) {
    return false;
  }

  const pendingCall = state.round.pendingCall;
  if (!pendingCall || pendingCall.kind !== "truco" || pendingCall.callKey !== "truco") {
    return false;
  }

  return pendingCall.responder === player && canTeamCallEnvidoNow(pendingCall.responderTeam);
}

function setActionButtonVisible(button, visible) {
  if (!button) {
    return;
  }

  button.classList.toggle("is-hidden-action", !visible);
  button.disabled = !visible;
}

function getActionAvailability() {
  const pendingCall = state.round?.pendingCall ?? null;
  const roundOver = Boolean(state.round?.roundOver);
  const matchOver = isMatchOver();
  const waitingForResponse = Boolean(pendingCall);
  const sequenceLock = isSequenceLocked();
  const userTurn = isUserTurn();
  const controlledResponder = getUserControlledResponder();
  const userResponding = Boolean(controlledResponder);
  const responseActor = controlledResponder ?? "jugador";
  const userCanInterruptTruco = canInterruptTrucoWithEnvido(responseActor);
  const userCanRaiseRealEnvido = canRaisePendingEnvido("realEnvido", responseActor);
  const userCanRaiseFaltaEnvido = canRaisePendingEnvido("faltaEnvido", responseActor);
  const canCounterPendingTruco = Boolean(userResponding && !sequenceLock && getPendingTrucoRaiseState(responseActor));
  const waitingForUserPass = Boolean(getActiveEnvidoReveal()?.waitingForUserPass);
  const canCallTruco = Boolean(
    !waitingForResponse
      ? userTurn && !sequenceLock && getTrucoCallState("jugador")
      : canCounterPendingTruco,
  );
  const canCallEnvidoNow = userTurn && canStartEnvido("jugador");
  const canInterruptWithEnvido = waitingForResponse && pendingCall?.kind === "truco" && userCanInterruptTruco;

  return {
    pendingCall,
    roundOver,
    matchOver,
    waitingForResponse,
    sequenceLock,
    userTurn,
    userResponding,
    controlledResponder,
    userCanInterruptTruco,
    userCanRaiseRealEnvido,
    userCanRaiseFaltaEnvido,
    canCounterPendingTruco,
    waitingForUserPass,
    canCallTruco,
    canCallEnvidoNow,
    canInterruptWithEnvido,
    visible: {
      truco: canCallTruco,
      mazo: Boolean(userTurn && !roundOver && !waitingForResponse && !sequenceLock),
      paso: waitingForUserPass,
      quiero: userResponding && !sequenceLock,
      noQuiero: userResponding && !sequenceLock,
      envido: canCallEnvidoNow || canInterruptWithEnvido,
      realEnvido: canCallEnvidoNow || canInterruptWithEnvido || userCanRaiseRealEnvido,
      faltaEnvido: canCallEnvidoNow || canInterruptWithEnvido || userCanRaiseFaltaEnvido,
      next: roundOver && !matchOver,
      newGame: true,
    },
  };
}

function renderActionButtons() {
  const actionState = getActionAvailability();
  renderTrucoButton();
  const passImage = document.querySelector("#btn-paso img");
  const revealConcessionKey = actionState.waitingForUserPass
    ? getEnvidoConcessionKey("jugador") ?? "paso"
    : "paso";
  if (passImage) {
    passImage.src = revealConcessionKey === "sonBuenas" ? buttons.sonBuenas : buttons.paso;
    passImage.alt = revealConcessionKey === "sonBuenas" ? "Son buenas" : "Paso";
  }
  setActionButtonVisible(actionButtons.truco, actionState.visible.truco);
  setActionButtonVisible(actionButtons.mazo, actionState.visible.mazo);
  setActionButtonVisible(actionButtons.paso, actionState.visible.paso);
  setActionButtonVisible(actionButtons.quiero, actionState.visible.quiero);
  setActionButtonVisible(actionButtons.noQuiero, actionState.visible.noQuiero);
  setActionButtonVisible(actionButtons.envido, actionState.visible.envido);
  setActionButtonVisible(actionButtons.realEnvido, actionState.visible.realEnvido);
  setActionButtonVisible(actionButtons.faltaEnvido, actionState.visible.faltaEnvido);
  setActionButtonVisible(actionButtons.next, actionState.visible.next);
  setActionButtonVisible(actionButtons.newGame, actionState.visible.newGame);
}

function syncTurnUi() {
  renderHand();
  renderActionButtons();
  scheduleIdleBanter();
}

function getTrucoCallState(player = "jugador") {
  if (!state.round) {
    return null;
  }

  const sequence = state.manifest?.rules?.truco?.sequence ?? ["truco", "quieroRetruco", "quieroVale4"];
  const acceptedPoints = state.manifest?.rules?.truco?.acceptedPoints ?? {
    truco: 2,
    quieroRetruco: 3,
    quieroVale4: 4,
  };
  const declinedPoints = state.manifest?.rules?.truco?.declinedPoints ?? {
    truco: 1,
    quieroRetruco: 2,
    quieroVale4: 3,
  };

  if (state.round.trucoStake <= 1) {
    const callKey = sequence[0];
    return {
      callKey,
      callLabel: callText(callKey, "TRUCO"),
      nextStake: acceptedPoints[callKey],
      declineStake: declinedPoints[callKey],
    };
  }

  const currentIndex = sequence.findIndex((key) => acceptedPoints[key] === state.round.trucoStake);
  if (currentIndex < 0 || currentIndex >= sequence.length - 1) {
    return null;
  }

  if (state.round.lastTrucoCallerTeam === getTeamForPlayer(player)) {
    return null;
  }

  const callKey = sequence[currentIndex + 1];
  return {
    callKey,
    callLabel: callText(callKey, callKey.toUpperCase()),
    nextStake: acceptedPoints[callKey],
    declineStake: declinedPoints[callKey],
  };
}

function getPendingTrucoRaiseState(player = "jugador") {
  if (!state.round?.pendingCall || state.round.pendingCall.kind !== "truco") {
    return null;
  }

  if (state.round.pendingCall.responder !== player) {
    return null;
  }

  const sequence = state.manifest?.rules?.truco?.sequence ?? ["truco", "quieroRetruco", "quieroVale4"];
  const acceptedPoints = state.manifest?.rules?.truco?.acceptedPoints ?? {
    truco: 2,
    quieroRetruco: 3,
    quieroVale4: 4,
  };
  const declinedPoints = state.manifest?.rules?.truco?.declinedPoints ?? {
    truco: 1,
    quieroRetruco: 2,
    quieroVale4: 3,
  };
  const currentIndex = sequence.indexOf(state.round.pendingCall.callKey ?? "truco");
  if (currentIndex < 0 || currentIndex >= sequence.length - 1) {
    return null;
  }

  const callKey = sequence[currentIndex + 1];
  return {
    callKey,
    callLabel: callText(callKey, callKey.toUpperCase()),
    nextStake: acceptedPoints[callKey],
    declineStake: declinedPoints[callKey],
  };
}

function shouldCpuAcceptTruco(player) {
  const team = getTeamForPlayer(player);
  const ownBestCard = getBestTrucoCard(getPlayerHand(player));
  const teamBestStrength = getTeamBestTrucoStrength(team);
  const wonTricks = countWonTricks();
  const stake = state.round?.pendingCall?.nextStake ?? state.round?.trucoStake ?? 1;
  const scoreGap = (state.match.scores[getOpposingTeam(team)] ?? 0) - (state.match.scores[team] ?? 0);
  const earlyPressure = state.round?.trickIndex === 0 && (state.round?.trickPlays?.length ?? 0) <= 1;

  if ((wonTricks[team] ?? 0) > 0) {
    return true;
  }

  if (stake >= 4) {
    return teamBestStrength >= 12;
  }

  if (stake >= 3) {
    return teamBestStrength >= 10 || (teamBestStrength >= 9 && scoreGap >= 3);
  }

  if (teamBestStrength >= 9) {
    return true;
  }

  if (earlyPressure && teamBestStrength >= 8) {
    return true;
  }

  if (scoreGap >= 4 && teamBestStrength >= 8) {
    return true;
  }

  return (ownBestCard?.trucoStrength ?? 0) >= 8;
}

function getEnvidoStakeValue(callKey) {
  const matchTarget = state.manifest?.rules?.matchPoints ?? 15;
  const values = {
    envido: 2,
    realEnvido: 3,
    faltaEnvido: Math.max(1, matchTarget - Math.max(state.match.scores.teamOne, state.match.scores.teamTwo)),
  };

  return values[callKey] ?? 2;
}

function getEnvidoCallState(callKey) {
  return {
    callKey,
    kind: "envido",
    callLabel: callText(callKey, callKey.toUpperCase()),
    nextStake: getEnvidoStakeValue(callKey),
    declineStake: 1,
  };
}

function getPointsToWin(team) {
  const matchTarget = state.manifest?.rules?.matchPoints ?? 15;
  return Math.max(0, matchTarget - (state.match.scores[team] ?? 0));
}

function getBestEnvidoResult(team) {
  const candidates = getTeamMembers(team).map((player) => ({
    player,
    score: computeEnvidoScore(getPlayerEnvidoHand(player)) ?? 0,
  }));

  const bestScore = Math.max(...candidates.map((candidate) => candidate.score));
  const bestCandidates = candidates.filter((candidate) => candidate.score === bestScore);
  const handStarter = state.round?.handStarter;

  return bestCandidates.find((candidate) => candidate.player === handStarter) ?? bestCandidates[0];
}

function getTeamBestEnvidoScore(team) {
  return getBestEnvidoResult(team)?.score ?? 0;
}

function getTeamBestTrucoStrength(team) {
  return Math.max(
    0,
    ...getTeamMembers(team).map((player) => getBestTrucoCard(getPlayerHand(player))?.trucoStrength ?? 0),
  );
}

function getEligibleTeamEnvidoCallers(team) {
  return getTeamMembers(team).filter((member) => canPlayerCallEnvidoNow(member));
}

function shouldCpuOpenFaltaEnvido(player, score) {
  const team = getTeamForPlayer(player);
  const pointsToWin = getPointsToWin(team);
  const opponentPointsToWin = getPointsToWin(getOpposingTeam(team));
  return score >= 33 && (pointsToWin <= 4 || opponentPointsToWin <= 3);
}

function shouldCpuRaiseToFaltaEnvido(player, score, pendingCall) {
  const team = getTeamForPlayer(player);
  const pointsToWin = getPointsToWin(team);
  const opponentPointsToWin = getPointsToWin(getOpposingTeam(team));

  if (score < 33) {
    return false;
  }

  if (pendingCall?.callKey === "realEnvido") {
    return pointsToWin <= 6 || opponentPointsToWin <= 3;
  }

  return pointsToWin <= 4 || opponentPointsToWin <= 2;
}

function shouldCpuPreserveEnvidoWindow(player) {
  if (!state.round || state.round.roundOver || state.round.trickIndex !== 0 || state.round.pendingCall || state.round.envidoResolved) {
    return false;
  }

  const team = getTeamForPlayer(player);
  const eligibleCallers = getEligibleTeamEnvidoCallers(team);
  if (!eligibleCallers.length || eligibleCallers.includes(player)) {
    return false;
  }

  return getTeamBestEnvidoScore(team) >= 24;
}

function shouldCpuAcceptEnvido(player, stake) {
  const result = getBestEnvidoResult(getTeamForPlayer(player));
  const pointsToWin = getPointsToWin(getTeamForPlayer(player));

  if (result.score >= 33) {
    return true;
  }

  if (result.score >= 31) {
    return stake <= Math.max(6, Math.min(pointsToWin, 8));
  }

  if (result.score >= 29) {
    return stake <= 4;
  }

  if (result.score >= 27) {
    return stake <= 3;
  }

  if (result.score >= 25) {
    return stake <= 2;
  }

  return stake <= 1 && result.score >= 23;
}

function shouldCpuInterruptTrucoWithEnvido(player) {
  const team = getTeamForPlayer(player);
  const envidoScore = getTeamBestEnvidoScore(team);
  const trucoStrength = getTeamBestTrucoStrength(team);
  const earlyPressure = state.round?.trickIndex === 0 && (state.round?.trickPlays?.length ?? 0) <= 1;

  if (envidoScore >= 28) {
    return true;
  }

  if (envidoScore >= 26 && earlyPressure) {
    return true;
  }

  return envidoScore >= 24 && trucoStrength <= 9;
}

function shouldCpuCallTruco(player, callKey) {
  const bestCard = getBestTrucoCard(getPlayerHand(player));
  const thresholds = {
    truco: 11,
    quieroRetruco: 12,
    quieroVale4: 13,
  };

  return (bestCard?.trucoStrength ?? 0) >= (thresholds[callKey] ?? 11);
}

function shouldCpuRaisePendingTruco(player, callKey) {
  const team = getTeamForPlayer(player);
  const teamBestStrength = getTeamBestTrucoStrength(team);
  const wonTricks = countWonTricks();
  const scoreGap = (state.match.scores[getOpposingTeam(team)] ?? 0) - (state.match.scores[team] ?? 0);
  const earlyPressure = state.round?.trickIndex === 0 && (state.round?.trickPlays?.length ?? 0) <= 1;

  if (callKey === "quieroVale4") {
    return teamBestStrength >= 12 || ((wonTricks[team] ?? 0) > 0 && teamBestStrength >= 11);
  }

  if (callKey === "quieroRetruco") {
    if (teamBestStrength >= 10) {
      return true;
    }

    return (earlyPressure || scoreGap >= 4) && teamBestStrength >= 9;
  }

  return false;
}

function canRaisePendingEnvido(callKey, player = "jugador") {
  if (!state.round || state.round.roundOver || isSequenceLocked()) {
    return false;
  }

  const pendingCall = state.round.pendingCall;
  if (!pendingCall || pendingCall.kind !== "envido") {
    return false;
  }

  if (pendingCall.responder !== player) {
    return false;
  }

  if (callKey === "realEnvido") {
    return pendingCall.callKey === "envido";
  }

  if (callKey === "faltaEnvido") {
    return pendingCall.callKey !== "faltaEnvido";
  }

  return false;
}

function getTrucoButtonAsset(callKey) {
  const variants = {
    truco: { src: buttons.truco, alt: "Truco" },
    quieroRetruco: { src: buttons.quieroRetruco, alt: "Quiero retruco" },
    quieroVale4: { src: buttons.quieroVale4, alt: "Quiero vale cuatro" },
  };

  return variants[callKey] ?? variants.truco;
}

function renderTrucoButton() {
  const image = document.querySelector("#btn-truco img");
  if (!image) {
    return;
  }

  const controlledResponder = getUserControlledResponder();
  const callState = controlledResponder
    ? getPendingTrucoRaiseState(controlledResponder) ?? getTrucoCallState("jugador")
    : getTrucoCallState("jugador");
  const variant = getTrucoButtonAsset(callState?.callKey ?? "truco");
  image.src = variant.src;
  image.alt = variant.alt;
}

function clearPendingCall() {
  if (!state.round) {
    return;
  }

  state.round.pendingCall = null;
}

function clearSuspendedCall() {
  if (!state.round) {
    return;
  }

  state.round.suspendedCall = null;
}

function resumeRoundAfterCallFlow() {
  if (!state.round || state.round.roundOver) {
    return;
  }

  clearSuspendedCall();

  renderActionButtons();
  scheduleRoundStep(() => {
    continueRound();
  }, NEXT_TURN_DELAY_MS);
}

function formatEnvidoReveal(score) {
  return `${callText("yoTengo", "YO TENGO ")}${score}`;
}

function getEnvidoQuestionText() {
  return callText("queTenes", "QUE TENES");
}

function getActiveEnvidoReveal() {
  return state.round?.envidoReveal ?? null;
}

function canPassEnvidoReveal(player, revealState = getActiveEnvidoReveal()) {
  if (!revealState || revealState.currentBestScore < 0) {
    return false;
  }

  const score = revealState.playerScores[player] ?? 0;
  if (score > revealState.currentBestScore) {
    return false;
  }

  if (score < revealState.currentBestScore) {
    return true;
  }

  const playerTeam = getTeamForPlayer(player);
  return !(playerTeam === revealState.handStarterTeam && revealState.currentBestTeam !== playerTeam);
}

function canLaterTeammateChallengeEnvido(revealState, player) {
  if (!revealState) {
    return false;
  }

  const playerTeam = getTeamForPlayer(player);
  const remainingTeammates = revealState.revealPlayers
    .slice(revealState.index + 1)
    .filter((candidate) => getTeamForPlayer(candidate) === playerTeam);

  return remainingTeammates.some((candidate) => {
    const score = revealState.playerScores[candidate] ?? 0;
    if (score > revealState.currentBestScore) {
      return true;
    }

    return (
      score === revealState.currentBestScore
      && playerTeam === revealState.handStarterTeam
      && revealState.currentBestTeam !== playerTeam
    );
  });
}

function getEnvidoConcessionKey(player, revealState = getActiveEnvidoReveal()) {
  if (!canPassEnvidoReveal(player, revealState)) {
    return null;
  }

  return canLaterTeammateChallengeEnvido(revealState, player) ? "paso" : "sonBuenas";
}

function updateEnvidoRevealLeader(revealState, player) {
  const score = revealState.playerScores[player] ?? 0;
  const playerTeam = getTeamForPlayer(player);

  if (score > revealState.currentBestScore) {
    revealState.currentBestScore = score;
    revealState.currentBestTeam = playerTeam;
    revealState.currentBestPlayer = player;
    return;
  }

  if (
    score === revealState.currentBestScore
    && playerTeam === revealState.handStarterTeam
    && revealState.currentBestTeam !== playerTeam
  ) {
    revealState.currentBestTeam = playerTeam;
    revealState.currentBestPlayer = player;
  }
}

function finalizeEnvidoReveal(revealState) {
  state.match.scores[revealState.winnerTeam] += revealState.pendingCall.nextStake;
  state.round.envidoResolved = true;
  state.round.sequenceLock = false;
  state.round.envidoReveal = null;
  clearPendingCall();
  renderMatchScore();
  const matchTarget = state.manifest?.rules?.matchPoints ?? 15;
  if (state.match.scores[revealState.winnerTeam] >= matchTarget) {
    endMatch(revealState.winnerTeam, revealState.winnerResult.player);
    return;
  }
  updateCallout(`${getPlayerLabel(revealState.winnerResult.player)} GANA EL ENVIDO CON ${revealState.winnerResult.score}.`);
  resumeRoundAfterCallFlow();
}

function continueEnvidoReveal() {
  const revealState = getActiveEnvidoReveal();
  if (!revealState || !state.round) {
    return;
  }

  if (revealState.index >= revealState.revealPlayers.length) {
    if (
      !revealState.anyPass
      && state.manifest?.rules?.envido?.sonBuenasRequiredToConcede !== false
      && revealState.losingResult?.player
    ) {
      announcePlayerLine(
        revealState.losingResult.player,
        callText("sonBuenas", "SON BUENAS"),
        getActionVoiceSequence("sonBuenas"),
      );
      revealState.anyPass = true;
      scheduleRoundStep(() => {
        finalizeEnvidoReveal(revealState);
      }, ENVIDO_REVEAL_DELAY_MS);
      return;
    }

    finalizeEnvidoReveal(revealState);
    return;
  }

  if (revealState.phase === "ask" && revealState.index > 0) {
    const previousPlayer = revealState.revealPlayers[revealState.index - 1];
    announcePlayerLine(previousPlayer, getEnvidoQuestionText(), getPhraseVoiceSequence("queTenes"));
    revealState.phase = "respond";
    scheduleRoundStep(() => {
      continueEnvidoReveal();
    }, ENVIDO_REVEAL_DELAY_MS);
    return;
  }

  const player = revealState.revealPlayers[revealState.index];
  const score = revealState.playerScores[player] ?? 0;
  const concessionKey = getEnvidoConcessionKey(player, revealState);
  const canPass = Boolean(concessionKey);

  if (player === "jugador" && canPass) {
    revealState.waitingForUserPass = true;
    renderActionButtons();
    updateCallout(
      concessionKey === "sonBuenas"
        ? "DECIDI SON BUENAS O MOSTRA TU ENVIDO"
        : "DECIDI PASO O MOSTRA TU ENVIDO",
    );
    return;
  }

  if (canPass) {
    revealState.anyPass = true;
    announcePlayerLine(
      player,
      callText(concessionKey, concessionKey === "sonBuenas" ? "SON BUENAS" : "PASO"),
      getActionVoiceSequence(concessionKey),
    );
    if (concessionKey === "sonBuenas") {
      scheduleRoundStep(() => {
        finalizeEnvidoReveal(revealState);
      }, ENVIDO_REVEAL_DELAY_MS);
      return;
    }
  } else {
    announcePlayerLine(
      player,
      formatEnvidoReveal(score),
      [...getPhraseVoiceSequence("yoTengo"), ...getSpokenNumberVoiceSequence(score)],
    );
    updateEnvidoRevealLeader(revealState, player);
  }

  revealState.index += 1;
  revealState.phase = "ask";
  scheduleRoundStep(() => {
    continueEnvidoReveal();
  }, ENVIDO_REVEAL_DELAY_MS);
}

function userPassEnvidoReveal() {
  const revealState = getActiveEnvidoReveal();
  if (!revealState?.waitingForUserPass) {
    return false;
  }

  clearRoundTimer(state.round);
  revealState.waitingForUserPass = false;
  revealState.anyPass = true;
  renderActionButtons();
  const concessionKey = getEnvidoConcessionKey("jugador", revealState) ?? "paso";
  announcePlayerLine(
    "jugador",
    callText(concessionKey, concessionKey === "sonBuenas" ? "SON BUENAS" : "PASO"),
    getActionVoiceSequence(concessionKey),
  );
  if (concessionKey === "sonBuenas") {
    scheduleRoundStep(() => {
      finalizeEnvidoReveal(revealState);
    }, ENVIDO_REVEAL_DELAY_MS);
    return true;
  }
  revealState.index += 1;
  revealState.phase = "ask";
  scheduleRoundStep(() => {
    continueEnvidoReveal();
  }, ENVIDO_REVEAL_DELAY_MS);
  return true;
}

function raisePendingTruco(player) {
  const raiseState = getPendingTrucoRaiseState(player);
  if (!raiseState) {
    return false;
  }

  clearRoundTimer(state.round);
  const pendingCall = state.round.pendingCall;
  state.round.pendingCall = {
    kind: "truco",
    callKey: raiseState.callKey,
    caller: player,
    callerTeam: getTeamForPlayer(player),
    responder: pendingCall.caller,
    responderTeam: pendingCall.callerTeam,
    nextStake: raiseState.nextStake,
    declineStake: raiseState.declineStake,
  };

  announcePlayerLine(player, raiseState.callLabel, getActionVoiceSequence(raiseState.callKey));
  updateCallout(`${getPlayerLabel(player)} CANTA ${raiseState.callLabel}`);
  renderActionButtons();
  queueCpuPendingCallResponse();
  return true;
}

function finishEnvidoCall(pendingCall) {
  const teamOne = getBestEnvidoResult("teamOne");
  const teamTwo = getBestEnvidoResult("teamTwo");
  const handStarterTeam = getTeamForPlayer(state.round.handStarter);
  const manoOrder = getPlayersInManoOrder();
  const playerScores = Object.fromEntries(
    manoOrder.map((player) => [player, computeEnvidoScore(getPlayerEnvidoHand(player)) ?? 0]),
  );

  let winnerTeam = "teamOne";
  let winnerResult = teamOne;
  if (teamTwo.score > teamOne.score) {
    winnerTeam = "teamTwo";
    winnerResult = teamTwo;
  } else if (teamTwo.score === teamOne.score && handStarterTeam === "teamTwo") {
    winnerTeam = "teamTwo";
    winnerResult = teamTwo;
  }

  const losingTeam = getOpposingTeam(winnerTeam);
  const losingResult = losingTeam === "teamOne" ? teamOne : teamTwo;
  state.round.sequenceLock = true;
  state.round.envidoReveal = {
    pendingCall,
    revealPlayers: [...manoOrder],
    playerScores,
    winnerTeam,
    winnerResult,
    losingResult,
    handStarterTeam,
    currentBestScore: -1,
    currentBestTeam: null,
    currentBestPlayer: null,
    index: 0,
    phase: "respond",
    anyPass: false,
    waitingForUserPass: false,
  };
  renderActionButtons();
  continueEnvidoReveal();
}

function resolvePendingCallResponse(player, accepted) {
  if (!state.round?.pendingCall) {
    return false;
  }

  const pendingCall = state.round.pendingCall;
  if (player !== pendingCall.responder) {
    return false;
  }

  clearRoundTimer(state.round);
  if (pendingCall.kind === "envido") {
    if (!accepted) {
      announcePlayerLine(player, callText("noQuiero", "NO QUIERO"), getActionVoiceSequence("noQuiero"));
      state.match.scores[pendingCall.callerTeam] += pendingCall.declineStake;
      state.round.envidoResolved = true;
      clearPendingCall();
      renderMatchScore();
      const matchTarget = state.manifest?.rules?.matchPoints ?? 15;
      if (state.match.scores[pendingCall.callerTeam] >= matchTarget) {
        endMatch(pendingCall.callerTeam, pendingCall.caller);
        return true;
      }
      updateCallout(`${getPlayerLabel(player)} NO QUIERE. ${pendingCall.callerTeam === "teamOne" ? "EQUIPO UNO" : "EQUIPO DOS"} SUMA ${pendingCall.declineStake}.`);
      resumeRoundAfterCallFlow();
      return true;
    }

    announcePlayerLine(player, callText("quiero", "QUIERO"), getActionVoiceSequence("quiero"));
    scheduleRoundStep(() => {
      finishEnvidoCall(pendingCall);
    }, ENVIDO_REVEAL_DELAY_MS);
    return true;
  }

  if (!accepted) {
    announcePlayerLine(player, callText("noQuiero", "NO QUIERO"), getActionVoiceSequence("noQuiero"));
    state.round.trucoStake = pendingCall.declineStake;
    clearPendingCall();
    endRound(pendingCall.callerTeam, `${getPlayerLabel(player)} ${callText("noQuiero", "NO QUIERO")}`);
    return true;
  }

  announcePlayerLine(player, callText("quiero", "QUIERO"), getActionVoiceSequence("quiero"));
  state.round.trucoStake = pendingCall.nextStake;
  state.round.lastTrucoCallerTeam = pendingCall.callerTeam;
  clearPendingCall();
  updateCallout(`${getPlayerLabel(player)} QUIERE. TRUCO VALE ${state.round.trucoStake}.`);
  renderActionButtons();
  scheduleRoundStep(() => {
    continueRound();
  }, NEXT_TURN_DELAY_MS);
  return true;
}

function raisePendingEnvido(player, callKey) {
  if (!canRaisePendingEnvido(callKey, player)) {
    return false;
  }

  clearRoundTimer(state.round);
  const pendingCall = state.round.pendingCall;
  state.round.pendingCall = {
    ...pendingCall,
    caller: player,
    callerTeam: getTeamForPlayer(player),
    responder: pendingCall.caller,
    responderTeam: pendingCall.callerTeam,
    callKey,
    callLabel: callText(callKey, callKey.toUpperCase()),
    nextStake: pendingCall.nextStake + getEnvidoStakeValue(callKey),
    declineStake: pendingCall.nextStake,
  };

  announcePlayerLine(player, callText(callKey, callKey.toUpperCase()), getActionVoiceSequence(callKey));
  updateCallout(`${getPlayerLabel(player)} CANTA ${callText(callKey, callKey.toUpperCase())}`);
  renderActionButtons();
  queueCpuPendingCallResponse();
  return true;
}

function maybeCpuInitiateCall(player) {
  if (!state.round || state.round.roundOver || state.round.pendingCall || isSequenceLocked()) {
    return false;
  }

  if (canStartEnvido(player)) {
    const envidoScore = getTeamBestEnvidoScore(getTeamForPlayer(player));
    if (shouldCpuOpenFaltaEnvido(player, envidoScore)) {
      scheduleRoundStep(() => {
        callEnvido(player, "faltaEnvido");
      }, CPU_PLAY_DELAY_MS);
      return true;
    }

    if (envidoScore >= 29) {
      scheduleRoundStep(() => {
        callEnvido(player, "realEnvido");
      }, CPU_PLAY_DELAY_MS);
      return true;
    }

    if (envidoScore >= 24) {
      scheduleRoundStep(() => {
        callEnvido(player, "envido");
      }, CPU_PLAY_DELAY_MS);
      return true;
    }
  }

  if (shouldCpuPreserveEnvidoWindow(player)) {
    return false;
  }

  const trucoState = getTrucoCallState(player);
  if (trucoState && shouldCpuCallTruco(player, trucoState.callKey)) {
    scheduleRoundStep(() => {
      callTruco(player);
    }, CPU_PLAY_DELAY_MS);
    return true;
  }

  return false;
}

function queueCpuPendingCallResponse() {
  if (!state.round?.pendingCall) {
    return;
  }

  const pendingCall = state.round.pendingCall;
  const responder = pendingCall.responder;
  if (!responder || getUserControlledResponder()) {
    const controlledResponder = getUserControlledResponder();
    updateCallout(
      pendingCall.kind === "envido"
        ? `${getPlayerLabel(controlledResponder ?? "jugador")} TE PIDE RESPUESTA AL ENVIDO`
        : canInterruptTrucoWithEnvido(controlledResponder ?? "jugador")
          ? `${getPlayerLabel(controlledResponder ?? "jugador")} TE PIDE RESPONDER TRUCO O CANTAR ENVIDO`
          : `${getPlayerLabel(controlledResponder ?? "jugador")} TE PIDE RESPUESTA`,
    );
    renderActionButtons();
    return;
  }

  scheduleRoundStep(() => {
    if (pendingCall.kind === "envido" && pendingCall.callKey === "envido") {
      const envidoScore = getTeamBestEnvidoScore(getTeamForPlayer(responder));
      if (envidoScore >= 29 && canRaisePendingEnvido("realEnvido", responder)) {
        raisePendingEnvido(responder, "realEnvido");
        return;
      }
      if (shouldCpuRaiseToFaltaEnvido(responder, envidoScore, pendingCall) && canRaisePendingEnvido("faltaEnvido", responder)) {
        raisePendingEnvido(responder, "faltaEnvido");
        return;
      }
    }

    if (pendingCall.kind === "envido" && pendingCall.callKey === "realEnvido") {
      const envidoScore = getTeamBestEnvidoScore(getTeamForPlayer(responder));
      if (shouldCpuRaiseToFaltaEnvido(responder, envidoScore, pendingCall) && canRaisePendingEnvido("faltaEnvido", responder)) {
        raisePendingEnvido(responder, "faltaEnvido");
        return;
      }
    }

    if (pendingCall.kind === "truco" && canInterruptTrucoWithEnvido(responder) && shouldCpuInterruptTrucoWithEnvido(responder)) {
      callEnvido(responder, "envido");
      return;
    }

    if (pendingCall.kind === "truco") {
      const raiseState = getPendingTrucoRaiseState(responder);
      if (raiseState && shouldCpuRaisePendingTruco(responder, raiseState.callKey)) {
        raisePendingTruco(responder);
        return;
      }
    }

    const accepted = pendingCall.kind === "envido"
      ? shouldCpuAcceptEnvido(responder, pendingCall.nextStake)
      : shouldCpuAcceptTruco(responder);
    resolvePendingCallResponse(responder, accepted);
  }, CPU_PLAY_DELAY_MS);
}

function callTruco(player) {
  if (!state.round || state.round.roundOver) {
    announcePlayerLine(player, callText("truco", "TRUCO"), getActionVoiceSequence("truco"));
    return;
  }

  clearBanterTimer();

  if (player !== getCurrentPlayer()) {
    if (player === "jugador") {
      updateCallout("TODAVIA NO TE TOCA");
    }
    return;
  }

  if (player === "jugador" && !isUserTurn()) {
    updateCallout("TODAVIA NO TE TOCA");
    return;
  }

  if (state.round.pendingCall) {
    updateCallout("YA HAY UNA APUESTA PENDIENTE");
    return;
  }

  if (isSequenceLocked()) {
    updateCallout("ESPERA A QUE TERMINE LA CANTADA ACTUAL");
    return;
  }

  const trucoState = getTrucoCallState(player);
  if (!trucoState) {
    updateCallout("TRUCO YA ESTA DEFINIDO EN ESTA RONDA");
    return;
  }

  clearRoundTimer(state.round);
  const callerTeam = getTeamForPlayer(player);
  const responder = getNextOpponent(player);
  if (!responder) {
    return;
  }

  state.round.pendingCall = {
    kind: "truco",
    callKey: trucoState.callKey,
    caller: player,
    callerTeam,
    responder,
    responderTeam: getTeamForPlayer(responder),
    nextStake: trucoState.nextStake,
    declineStake: trucoState.declineStake,
  };

  announcePlayerLine(player, trucoState.callLabel, getActionVoiceSequence(trucoState.callKey));
  updateCallout(`${getPlayerLabel(player)} CANTA ${trucoState.callLabel}`);
  renderActionButtons();
  queueCpuPendingCallResponse();
}

function callEnvido(player, callKey) {
  if (!state.round || state.round.roundOver) {
    announcePlayerLine(player, callText(callKey, callKey.toUpperCase()), getActionVoiceSequence(callKey));
    return;
  }

  clearBanterTimer();

  const raisingEnvido = canRaisePendingEnvido(callKey, player);
  const interruptingTruco = canInterruptTrucoWithEnvido(player);

  if (!raisingEnvido && !interruptingTruco && player !== getCurrentPlayer()) {
    if (player === "jugador") {
      updateCallout("TODAVIA NO TE TOCA");
    }
    return;
  }

  if (
    player === "jugador"
    && !isUserTurn()
    && !interruptingTruco
    && !raisingEnvido
  ) {
    updateCallout("TODAVIA NO TE TOCA");
    return;
  }

  if (isSequenceLocked()) {
    updateCallout("ESPERA A QUE TERMINE LA CANTADA ACTUAL");
    return;
  }

  if (!canStartEnvido(player) && !interruptingTruco) {
    updateCallout("ENVIDO SOLO VA EN LA PRIMERA BAZA Y LO CANTAN LOS ULTIMOS DOS");
    return;
  }

  clearRoundTimer(state.round);
  const interruptedCall = interruptingTruco ? state.round.pendingCall : null;
  const envidoState = getEnvidoCallState(callKey);
  if (interruptingTruco) {
    clearSuspendedCall();
    clearPendingCall();
  }

  const responder = interruptingTruco
    ? interruptedCall?.caller ?? getNextOpponent(player)
    : getNextOpponent(player);
  if (!responder) {
    return;
  }

  state.round.pendingCall = {
    ...envidoState,
    caller: player,
    callerTeam: getTeamForPlayer(player),
    responder,
    responderTeam: getTeamForPlayer(responder),
  };

  announcePlayerLine(player, envidoState.callLabel, getActionVoiceSequence(callKey));
  updateCallout(
    interruptingTruco
      ? `${getPlayerLabel(player)} CANTA ${envidoState.callLabel}. EL ENVIDO ESTA PRIMERO.`
      : `${getPlayerLabel(player)} CANTA ${envidoState.callLabel}`,
  );
  renderActionButtons();
  queueCpuPendingCallResponse();
}

function getRoundOverPrompt() {
  return "LA RONDA TERMINO. PRESIONA PROXIMA MANO";
}

function endMatch(winnerTeam, winningPlayer = null) {
  clearRoundTimer(state.round);
  clearBanterTimer();
  if (state.round) {
    state.round.roundOver = true;
    state.round.currentTurnIndex = -1;
    state.round.sequenceLock = false;
    state.round.pendingCall = null;
    state.round.suspendedCall = null;
    state.round.envidoReveal = null;
  }

  const speaker = winningPlayer ?? getTeamMembers(winnerTeam)[0] ?? "jugador";
  const winnerLine = getBanterSequences().winner ?? { text: "GANAMOS NOMAS", soundIds: [] };
  announcePlayerLine(speaker, winnerLine.text, winnerLine.soundIds);
  updateCallout(`${winnerTeam === "teamOne" ? "EQUIPO UNO" : "EQUIPO DOS"} GANA EL JUEGO. PRESIONA NUEVO JUEGO.`);
  renderActionButtons();
  renderHand();
}

function endRound(winnerTeam, message, winningPlayer = null) {
  if (!state.round || state.round.roundOver) {
    return;
  }

  clearRoundTimer(state.round);
  clearBanterTimer();
  state.round.roundOver = true;
  state.round.currentTurnIndex = -1;
  state.round.sequenceLock = false;
  state.round.pendingCall = null;
  state.round.suspendedCall = null;
  state.round.envidoReveal = null;
  state.match.lastRoundWinner = winningPlayer;
  state.match.scores[winnerTeam] += state.round.trucoStake;
  renderMatchScore();
  const matchTarget = state.manifest?.rules?.matchPoints ?? 15;
  if (state.match.scores[winnerTeam] >= matchTarget) {
    endMatch(winnerTeam, winningPlayer);
    return;
  }

  if (winningPlayer && seatOrder.includes(winningPlayer)) {
    announcePlayerLine(winningPlayer, message);
  }
  updateCallout(`${message}. ESPERANDO PROXIMA MANO.`);
  renderActionButtons();
  renderHand();
}

function determineHandWinner(trickResults, handStarter) {
  const [first, second, third] = trickResults;
  const handStarterTeam = getTeamForPlayer(handStarter);

  if (!first || !second) {
    return null;
  }

  if (first.type === "tie" && second.type === "tie") {
    return { team: handStarterTeam, player: handStarter };
  }

  if (first.type === "tie" && second.type === "lead") {
    return { team: second.winnerTeam, player: second.winnerPlayer };
  }

  if (first.type === "lead" && second.type === "tie") {
    return { team: first.winnerTeam, player: first.winnerPlayer };
  }

  if (first.type === "lead" && second.type === "lead" && first.winnerTeam === second.winnerTeam) {
    return { team: second.winnerTeam, player: second.winnerPlayer };
  }

  if (!third) {
    return null;
  }

  if (third.type === "tie") {
    if (first.type === "lead") {
      return { team: first.winnerTeam, player: first.winnerPlayer };
    }

    if (second.type === "lead") {
      return { team: second.winnerTeam, player: second.winnerPlayer };
    }

    return { team: handStarterTeam, player: handStarter };
  }

  return { team: third.winnerTeam, player: third.winnerPlayer };
}

function resolveTrick() {
  if (!state.round) {
    return;
  }

  const trickState = getCurrentTrickState(state.round.trickPlays);
  if (!trickState) {
    return;
  }

  const trickStarter = state.round.trickStarter;
  const trickResult = trickState.type === "tie"
    ? {
        type: "tie",
        winnerPlayer: null,
        winnerTeam: null,
        nextStarter: trickStarter,
      }
    : {
        type: "lead",
        winnerPlayer: trickState.player,
        winnerTeam: trickState.team,
        nextStarter: trickState.player,
      };

  state.round.trickResults.push(trickResult);
  const handWinner = determineHandWinner(state.round.trickResults, state.round.handStarter);
  if (handWinner) {
    endRound(handWinner.team, `${getPlayerLabel(handWinner.player)} GANA LA RONDA`, handWinner.player);
    return;
  }

  state.round.trickIndex += 1;
  state.round.trickPlays = [];
  state.round.trickStarter = trickResult.nextStarter;
  state.round.currentTurnIndex = getTurnIndex(trickResult.nextStarter);
  syncTurnUi();
  updateCallout(
    trickResult.type === "tie"
      ? `PARDA. SALE ${getPlayerLabel(trickResult.nextStarter)}`
      : `${getPlayerLabel(trickResult.winnerPlayer)} GANA LA BAZA Y SALE`,
  );
  scheduleRoundStep(() => {
    continueRound();
  }, NEXT_TRICK_DELAY_MS);
}

function continueRound() {
  if (!state.round || state.round.roundOver) {
    return;
  }

  if (isSequenceLocked()) {
    return;
  }

  syncTurnUi();

  if (state.round.pendingCall) {
    queueCpuPendingCallResponse();
    return;
  }

  const currentPlayer = getCurrentPlayer();
  if (!currentPlayer) {
    return;
  }

  announcePlayerLine(currentPlayer, getTurnPrompt(currentPlayer));
  if (currentPlayer !== "jugador") {
    const runCpuAction = () => {
      if (maybeCpuInitiateCall(currentPlayer)) {
        return;
      }

      const bitmapId = chooseCpuCard(currentPlayer);
      if (bitmapId !== null) {
        scheduleRoundStep(() => {
          playCard(currentPlayer, bitmapId);
        }, CPU_PLAY_DELAY_MS);
      }
    };

    if (maybeScheduleRandomBanter(currentPlayer, runCpuAction)) {
      return;
    }

    runCpuAction();
    return;
  }
}

function playCard(player, bitmapId) {
  if (!state.round || state.round.roundOver) {
    return;
  }

  clearBanterTimer();

  if (isSequenceLocked()) {
    return;
  }

  if (state.round.pendingCall) {
    return;
  }

  if (player !== getCurrentPlayer()) {
    return;
  }

  const currentHand = getPlayerHand(player);
  if (!currentHand.includes(bitmapId)) {
    return;
  }

  setPlayerHand(
    player,
    currentHand.filter((cardId) => cardId !== bitmapId),
  );
  state.tableCards[player] = [...state.tableCards[player], bitmapId];
  state.round.trickPlays.push({
    player,
    bitmapId,
    card: getCardEntry(bitmapId),
  });

  renderHand();
  renderHandAnalysis();
  renderTableCards();
  renderActionButtons();
  announcePlayerLine(player, formatPlayedCardCall(bitmapId), getCardVoiceSequence(bitmapId));

  if (state.round.trickPlays.length >= state.round.turnOrder.length) {
    scheduleRoundStep(() => {
      resolveTrick();
    }, TRICK_RESOLVE_DELAY_MS);
    return;
  }

  state.round.currentTurnIndex = (state.round.currentTurnIndex + 1) % state.round.turnOrder.length;
  syncTurnUi();
  scheduleRoundStep(() => {
    continueRound();
  }, NEXT_TURN_DELAY_MS);
}

function renderHand() {
  const hand = document.getElementById("player-hand");
  const isPlayerTurn = !state.round?.roundOver && getCurrentPlayer() === "jugador";
  hand.replaceChildren(
    ...state.hand.map((bitmapId) => {
      const card = document.createElement("img");
      card.className = "card";
      card.src = asset(`BITMAP/${bitmapId}.bmp`);
      card.alt = `Recovered card resource ${bitmapId}`;
      card.title = describeBitmap(`${bitmapId}.bmp`);
      card.dataset.active = String(isPlayerTurn);
      card.dataset.played = "false";
      card.addEventListener("click", () => {
        if (state.round?.roundOver) {
          updateCallout(getRoundOverPrompt());
          return;
        }

        if (state.round?.pendingCall) {
          const controlledResponder = getUserControlledResponder();
          if (controlledResponder) {
            updateCallout(
              state.round.pendingCall.kind === "truco" && canInterruptTrucoWithEnvido(controlledResponder)
                ? "RESPONDE TRUCO O CANTA ENVIDO"
                : "RESPONDE QUIERO O NO QUIERO",
            );
            return;
          }

          updateCallout(
            state.round.pendingCall.kind === "envido"
              ? "ESPERA LA RESPUESTA AL ENVIDO"
              : "ESPERA LA RESPUESTA AL TRUCO",
          );
          return;
        }

        if (getCurrentPlayer() !== "jugador") {
          updateCallout("TODAVIA NO TE TOCA");
          return;
        }

        playCard("jugador", bitmapId);
      });
      return card;
    }),
  );
}

function dealHands() {
  const dealSeed = getDealSeed(state.match.handNumber + 1);
  const deal = shuffle(getPlayableDeck(), createSeededRandom(dealSeed));
  return {
    dealSeed,
    jugador: deal.slice(0, 3),
    patrulla: deal.slice(3, 6),
    monstruo: deal.slice(6, 9),
    titan: deal.slice(9, 12),
  };
}

function newMatch() {
  clearRoundTimer(state.round);
  clearBanterTimer();
  randomBanterCooldownUntil = 0;
  const turnOrder = buildTurnOrder();
  state.match.handNumber = 0;
  state.match.manoIndex = 0;
  state.match.manoPlayer = turnOrder[0];
  state.match.lastRoundWinner = null;
  state.match.scores.teamOne = 0;
  state.match.scores.teamTwo = 0;
  clearSpeechLines();
  renderMatchScore();
  renderSeedPanel();
  renderActionButtons();
  newHand();
}

function newHand() {
  clearRoundTimer(state.round);
  clearBanterTimer();
  randomBanterCooldownUntil = 0;
  const dealtHands = dealHands();
  const { dealSeed, ...hands } = dealtHands;
  const turnOrder = buildTurnOrder();
  updateSeating(turnOrder);
  const startingPlayerIndex = state.match.manoIndex % turnOrder.length;
  const startingPlayer = turnOrder[startingPlayerIndex];

  state.match.handNumber += 1;
  state.match.manoIndex = (startingPlayerIndex + 1) % turnOrder.length;
  state.match.manoPlayer = turnOrder[state.match.manoIndex];
  state.round = {
    hands,
    initialHands: Object.fromEntries(
      Object.entries(hands).map(([player, hand]) => [player, [...hand]]),
    ),
    turnOrder,
    currentTurnIndex: startingPlayerIndex,
    handStarter: startingPlayer,
    trickStarter: startingPlayer,
    trickIndex: 0,
    trickPlays: [],
    trickResults: [],
    dealSeed,
    envidoResolved: false,
    lastTrucoCallerTeam: null,
    suspendedCall: null,
    pendingCall: null,
    envidoReveal: null,
    sequenceLock: false,
    roundOver: false,
    trucoStake: 1,
    timerId: null,
  };
  state.hand = hands.jugador;
  clearTableCards();
  clearSpeechLines();
  renderPortraits();
  renderMatchScore();
  renderHand();
  renderTableCards();
  renderHandAnalysis();
  renderSeedPanel();
  renderActionButtons();
  updateCallout(`MANO ${state.match.handNumber}. SALE ${getPlayerLabel(getCurrentPlayer())}`);
  scheduleRoundStep(() => {
    continueRound();
  }, TURN_ANNOUNCE_DELAY_MS);
}

function buildSoundEntries() {
  if (!state.manifest) {
    return [];
  }

  const typedById = new Map(
    (state.manifest.typedSoundCopies ?? []).map((entry) => [entry.id, entry.filename]),
  );

  return (state.manifest.soundResources ?? []).map((entry) => ({
    ...entry,
    filename: typedById.get(entry.id) ?? `${entry.id}.${entry.type === "midi" ? "mid" : "wav"}`,
  }));
}

function renderBitmapPreview(file) {
  bitmapPreview.replaceChildren();

  if (!file) {
    bitmapNote.textContent = "Recovered bitmap notes will appear here.";
    return;
  }

  const image = document.createElement("img");
  image.src = asset(`BITMAP/${file}`);
  image.alt = `Recovered bitmap ${file}`;
  image.title = describeBitmap(file);
  bitmapPreview.append(image);
  bitmapNote.textContent = describeBitmap(file);
}

function renderCharacterProfiles() {
  const profiles = state.manifest?.characterProfiles ?? [];
  profileList.replaceChildren(
    ...profiles.map((profile) => {
      const item = document.createElement("div");
      item.className = "profile-item";

      const title = document.createElement("strong");
      title.textContent = `${profile.index}: ${profile.displayName}`;

      const portrait = document.createElement("span");
      portrait.textContent = `Portrait: ${profile.portrait}`;

      const faces = document.createElement("span");
      faces.textContent = `Faces: ${profile.faceBitmaps.join(", ")}`;

      const signs = document.createElement("span");
      signs.textContent = `Signs: ${profile.signStripBitmaps.join(", ")}`;

      item.append(title, portrait, faces, signs);
      return item;
    }),
  );
}

function renderRecoveredCalls() {
  const entries = Object.entries(state.manifest?.callLexicon ?? {});
  callList.replaceChildren(
    ...entries.map(([key, value]) => {
      const item = document.createElement("li");
      item.textContent = `${key}: ${value}`;
      return item;
    }),
  );
}

function renderRecoveredRules() {
  const rules = state.manifest?.rules;
  rulesList.replaceChildren();

  if (!rules) {
    return;
  }

  const lines = [
    `${rules.variant}`,
    `${rules.matchPoints} puntos para ganar, corte en ${rules.splitScoreAt}.`,
    `${rules.cardsPerPlayer} cartas por jugador, ${rules.loopsPerRound} bazas por ronda.`,
    `${rules.envidoOnlyInFirstLoop ? "Envido solo en la primera baza." : "Envido sin restriccion de baza."}`,
    `${rules.trucoCanBeCalledAnyTime ? "Truco en cualquier momento de la ronda." : "Truco con restriccion temporal."}`,
    `${rules.florEnabled ? "Con flor." : "Sin flor."} ${rules.faltaEnvidoEnabled ? "Con falta envido." : "Sin falta envido."}`,
    `Truco: ${rules.truco.sequence.join(" -> ")}.`,
  ];

  rulesList.replaceChildren(
    ...lines.map((line) => {
      const item = document.createElement("li");
      item.textContent = line;
      return item;
    }),
  );
}

function renderInspector() {
  if (!state.manifest) {
    Object.values(manifestFields).forEach((field) => {
      field.textContent = "-";
    });
    setSelectPlaceholder(bitmapPicker, "manifest unavailable");
    setSelectPlaceholder(soundPicker, "manifest unavailable");
    bitmapNote.textContent = "Could not load the resource manifest.";
    audioNote.textContent = "Could not load the resource manifest.";
    handSummary.textContent = "Could not load the resource manifest.";
    handCards.replaceChildren();
    profileList.replaceChildren();
    callList.replaceChildren();
    rulesList.replaceChildren();
    return;
  }

  manifestFields.bitmaps.textContent = String(state.manifest.counts?.bitmaps ?? "-");
  manifestFields.sounds.textContent = String(state.manifest.counts?.sounds ?? "-");
  manifestFields.midi.textContent = String(state.manifest.counts?.midi ?? "-");
  manifestFields.wav.textContent = String(state.manifest.counts?.wav ?? "-");

  const bitmaps = state.manifest.bitmapResources ?? [];
  bitmapPicker.replaceChildren(
    ...bitmaps.map((file) => {
      const option = document.createElement("option");
      option.value = file;
      option.textContent = state.manifest.knownBitmaps?.[file]
        ? `${file} - ${state.manifest.knownBitmaps[file]}`
        : file;
      return option;
    }),
  );

  const preferredBitmap = bitmaps.includes("222.bmp") ? "222.bmp" : bitmaps[0] ?? "";
  bitmapPicker.value = preferredBitmap;
  renderBitmapPreview(preferredBitmap);

  const sounds = buildSoundEntries();
  soundPicker.replaceChildren(
    ...sounds.map((entry) => {
      const option = document.createElement("option");
      option.value = entry.filename;
      option.textContent = entry.externalMainTrack
        ? `${entry.filename} - MIDIC / main track`
        : `${entry.filename} - ${entry.type.toUpperCase()}`;
      return option;
    }),
  );

  if (sounds[0]) {
    soundPicker.value = sounds[0].filename;
  }
  audioNote.textContent = "Select a recovered sound resource.";
  renderHandAnalysis();
  renderCharacterProfiles();
  renderRecoveredCalls();
  renderRecoveredRules();
}

async function getWavAudioContext() {
  if (!AudioContextCtor) {
    return null;
  }

  if (!wavAudioContext) {
    wavAudioContext = new AudioContextCtor();
    wavGainNode = wavAudioContext.createGain();
    wavGainNode.connect(wavAudioContext.destination);
    applyVoiceAudioSettings();
  }

  if (wavAudioContext.state === "suspended") {
    await wavAudioContext.resume();
  }

  return wavAudioContext;
}

async function unlockAudio() {
  if (audioUnlocked || audioUnlockAttempted) {
    return;
  }

  audioUnlockAttempted = true;

  try {
    const context = await getWavAudioContext();
    if (context) {
      const source = context.createBufferSource();
      source.buffer = context.createBuffer(1, 1, context.sampleRate);
      source.connect(wavGainNode ?? context.destination);
      source.start();
      audioUnlocked = true;
      return;
    }

    effectPlayer.muted = true;
    effectPlayer.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YQAAAAA=";
    await effectPlayer.play();
    effectPlayer.pause();
    effectPlayer.currentTime = 0;
    effectPlayer.removeAttribute("src");
    effectPlayer.load();
    effectPlayer.muted = false;
    audioUnlocked = true;
  } catch (error) {
    audioUnlockAttempted = false;
    effectPlayer.muted = false;
    console.warn("Audio unlock is still pending a direct user gesture.", error);
  }
}

function stopWavPlayback() {
  if (!activeWavSource) {
    return;
  }

  try {
    activeWavSource.stop();
  } catch (error) {
    console.warn("Could not stop WAV source cleanly.", error);
  }
  activeWavSource.disconnect();
  activeWavSource = null;
}

function stopSpeechPlayback() {
  activeSpeechToken += 1;
  stopWavPlayback();
  effectPlayer.pause();
  effectPlayer.currentTime = 0;
  effectPlayer.removeAttribute("src");
  effectPlayer.load();
}

async function getWavBuffer(filename) {
  if (wavBufferCache.has(filename)) {
    return wavBufferCache.get(filename);
  }

  const context = await getWavAudioContext();
  if (!context) {
    return null;
  }

  const response = await fetch(getAudioAssetUrl(filename));
  if (!response.ok) {
    throw new Error(`WAV request failed with ${response.status}`);
  }

  const buffer = await response.arrayBuffer();
  const decoded = await context.decodeAudioData(buffer.slice(0));
  wavBufferCache.set(filename, decoded);
  return decoded;
}

function stopAllAudio(message = "Audio detenido.") {
  stopSpeechPlayback();
  [effectPlayer, midiPlayer].forEach((player) => {
    player.pause();
    player.currentTime = 0;
    player.removeAttribute("src");
    player.load();
  });
  audioNote.textContent = message;
}

function getMainMidiFilename() {
  const mainId = state.manifest?.mainMidiId ?? "200";
  const entry = buildSoundEntries().find((sound) => sound.id === mainId);
  return entry?.filename ?? `${mainId}.mid`;
}

async function getBackgroundMidiSynth() {
  if (backgroundMidiSynth || !window.WebAudioTinySynth) {
    return backgroundMidiSynth;
  }

  backgroundMidiSynth = new window.WebAudioTinySynth({
    useReverb: 1,
    quality: 1,
    voices: 64,
  });

  backgroundMidiSynth.setReverbLev?.(0.04);
  backgroundMidiSynth.setLoop?.(1);
  applyMusicAudioSettings();

  const context = backgroundMidiSynth.getAudioContext?.();
  if (context?.state === "suspended") {
    await context.resume();
  }

  return backgroundMidiSynth;
}

function stopBackgroundMusic() {
  if (!backgroundMidiSynth) {
    return;
  }

  try {
    backgroundMidiSynth.stopMIDI?.();
  } catch (error) {
    console.warn("Could not stop TinySynth background MIDI cleanly.", error);
  }

  backgroundMidiStarted = false;
}

async function ensureBackgroundMusicStarted({ restart = false, updateNote = false } = {}) {
  const filename = getMainMidiFilename();
  const label = `${filename} (MIDIC)`;
  const synth = await getBackgroundMidiSynth();

  if (!synth) {
    await playAudioFile(filename, label);
    return;
  }

  if (!backgroundMidiLoadPromise || backgroundMidiFilename !== filename) {
    backgroundMidiFilename = filename;
    backgroundMidiLoadPromise = (async () => {
      const response = await fetch(getAudioAssetUrl(filename));
      if (!response.ok) {
        throw new Error(`TinySynth MIDI request failed with ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      synth.loadMIDI(buffer);
    })();
  }

  try {
    await backgroundMidiLoadPromise;
    const context = synth.getAudioContext?.();
    if (context?.state === "suspended") {
      await context.resume();
    }

    if (restart) {
      synth.stopMIDI?.();
      backgroundMidiStarted = false;
    }

    if (!backgroundMidiStarted || !synth.getPlayStatus?.().play) {
      synth.playMIDI?.();
      backgroundMidiStarted = true;
    }

    if (updateNote) {
      audioNote.textContent = `Reproduciendo ${label} con TinySynth.`;
    }
  } catch (error) {
    backgroundMidiLoadPromise = null;
    backgroundMidiStarted = false;
    console.warn(`TinySynth could not start ${label}.`, error);

    if (updateNote) {
      audioNote.textContent = `TinySynth no pudo reproducir ${label}.`;
    }
  }
}

async function playWavClip(filename) {
  const context = await getWavAudioContext();
  if (!context) {
    return new Promise((resolve, reject) => {
      effectPlayer.onended = () => resolve();
      effectPlayer.onerror = () => reject(new Error(`HTMLAudioElement playback failed for ${filename}.`));
      effectPlayer.src = getAudioAssetUrl(filename);
      effectPlayer.currentTime = 0;
      effectPlayer.play().catch(reject);
    });
  }

  const buffer = await getWavBuffer(filename);
  if (!buffer) {
    throw new Error("Decoded WAV buffer unavailable.");
  }

  return new Promise((resolve, reject) => {
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(wavGainNode ?? context.destination);
    source.onended = () => {
      if (activeWavSource === source) {
        activeWavSource = null;
      }
      resolve();
    };
    activeWavSource = source;

    try {
      source.start();
    } catch (error) {
      reject(error);
    }
  });
}

async function playWavFile(filename, label, { updateNote = true } = {}) {
  if (updateNote) {
    audioNote.textContent = `Preparando ${label}...`;
  }

  stopSpeechPlayback();

  try {
    if (updateNote) {
      audioNote.textContent = `Reproduciendo ${label}.`;
    }
    await playWavClip(filename);
  } catch (error) {
    if (updateNote) {
      audioNote.textContent = `El navegador no pudo reproducir ${label}. El archivo sigue disponible en ./assets/audio/${filename}.`;
    }
    throw error;
  }
}

async function playAudioFile(filename, label, options = {}) {
  const isMidi = filename.endsWith(".mid");
  if (isMidi) {
    stopAllAudio(`Preparando ${label}...`);
    midiPlayer.src = getAudioAssetUrl(filename);

    try {
      await midiPlayer.play();
      audioNote.textContent = `Reproduciendo ${label}.`;
    } catch (error) {
      audioNote.textContent = `El navegador no pudo reproducir ${label}. El archivo sigue disponible en ./assets/audio/${filename}.`;
    }
    return;
  }

  try {
    await playWavFile(filename, label, options);
  } catch (error) {
    if (options.updateNote === false) {
      audioNote.textContent = `No se pudo reproducir ${filename}. Revisar compatibilidad de audio del navegador.`;
    }
    console.warn(`Recovered WAV playback failed for ${filename}.`, error);
  }
}

function playRecoveredSpeechSequence(soundIds) {
  const sequence = soundIds.filter(Boolean).map((soundId) => `${soundId}.wav`);
  if (!sequence.length) {
    return;
  }

  const token = activeSpeechToken + 1;
  stopSpeechPlayback();
  activeSpeechToken = token;

  void (async () => {
    for (const filename of sequence) {
      if (token !== activeSpeechToken) {
        return;
      }

      try {
        await playWavClip(filename);
      } catch (error) {
        console.warn(`Recovered speech playback failed for ${filename}.`, error);
        return;
      }
    }
  })();
}

function announceCall(key, fallback) {
  announcePlayerLine("jugador", callText(key, fallback), getActionVoiceSequence(key));
}

function playSelectedSound() {
  if (!soundPicker.value) {
    audioNote.textContent = "No hay sonido seleccionado.";
    return;
  }

  playAudioFile(soundPicker.value, soundPicker.value);
}

function playMainMidi() {
  void ensureBackgroundMusicStarted({ restart: true, updateNote: true });
}

function openPartnerChooser() {
  setScreen("splash");
  showOverlay("partner");
}

function showSplashScreen() {
  hideAllOverlays();
  setScreen("splash");
}

function showTableScreen() {
  hideAllOverlays();
  setScreen("table");
}

function attachMenuBehavior() {
  document.querySelectorAll("[data-menu-target]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const menu = document.getElementById(button.dataset.menuTarget);
      const alreadyOpen = !menu.classList.contains("is-hidden");
      closeMenus();
      if (!alreadyOpen) {
        menu.classList.remove("is-hidden");
      }
    });
  });

  document.addEventListener("click", () => {
    closeMenus();
  });
}

function attachOverlayBehavior() {
  ["about", "inspector"].forEach((name) => {
    overlays[name].addEventListener("click", (event) => {
      if (event.target === overlays[name]) {
        hideOverlay(name);
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      hideAllOverlays();
      stopAllAudio("Audio detenido.");
    }
  });
}

function attachAudioUnlock() {
  const unlock = () => {
    void unlockAudio();
  };

  document.addEventListener("pointerdown", unlock, { passive: true });
  document.addEventListener("keydown", unlock);
}

function applySeedFromInput() {
  const nextSeed = normalizeSeed(seedInput.value);
  if (!nextSeed) {
    updateCallout("INGRESA UN SEED VALIDO");
    seedInput.focus();
    return;
  }

  setMatchSeed(nextSeed);
  updateCallout(`SEED ${nextSeed} CARGADO`);
  if (state.manifest) {
    newMatch();
  }
}

function describeCardForSnapshot(bitmapId) {
  const card = getCardEntry(bitmapId);
  if (!card) {
    return {
      bitmapId,
      label: describeBitmap(`${bitmapId}.bmp`),
    };
  }

  return {
    bitmapId,
    label: card.label,
    suit: card.suit,
    rank: card.rank,
    envidoScore: card.envidoScore,
    trucoStrength: card.trucoStrength,
  };
}

function buildGameSnapshot() {
  const actionState = getActionAvailability();
  const visibleButtonNames = Object.entries(actionState.visible)
    .filter(([, visible]) => visible)
    .map(([name]) => name);
  const round = state.round
    ? {
        dealSeed: state.round.dealSeed,
        roundOver: state.round.roundOver,
        currentPlayer: getCurrentPlayer(),
        currentTurnIndex: state.round.currentTurnIndex,
        handStarter: state.round.handStarter,
        trickStarter: state.round.trickStarter,
        trickIndex: state.round.trickIndex,
        turnOrder: [...state.round.turnOrder],
        trucoStake: state.round.trucoStake,
        envidoResolved: state.round.envidoResolved,
        sequenceLock: state.round.sequenceLock,
        lastTrucoCallerTeam: state.round.lastTrucoCallerTeam,
        pendingCall: state.round.pendingCall,
        suspendedCall: state.round.suspendedCall,
        trickPlays: state.round.trickPlays.map((play) => ({
          player: play.player,
          team: getTeamForPlayer(play.player),
          card: describeCardForSnapshot(play.bitmapId),
        })),
        trickResults: state.round.trickResults.map((result) => ({ ...result })),
        hands: Object.fromEntries(
          Object.entries(state.round.hands).map(([player, hand]) => [
            player,
            hand.map((bitmapId) => describeCardForSnapshot(bitmapId)),
          ]),
        ),
        initialHands: Object.fromEntries(
          Object.entries(state.round.initialHands ?? {}).map(([player, hand]) => [
            player,
            hand.map((bitmapId) => describeCardForSnapshot(bitmapId)),
          ]),
        ),
      }
    : null;

  return {
    exportedAt: new Date().toISOString(),
    location: window.location.href,
    seed: {
      base: state.match.seed,
      currentHand: state.match.handNumber,
      currentDeal: state.round?.dealSeed ?? null,
      nextDeal: getDealSeed(state.match.handNumber + 1),
    },
    partner: state.partner,
    seating: {
      slotToPlayer: { ...state.seating.slotToPlayer },
      playerToSlot: { ...state.seating.playerToSlot },
    },
    match: {
      handNumber: state.match.handNumber,
      manoIndex: state.match.manoIndex,
      manoPlayer: state.match.manoPlayer,
      lastRoundWinner: state.match.lastRoundWinner,
      scores: { ...state.match.scores },
    },
    tableCards: Object.fromEntries(
      Object.entries(state.tableCards).map(([player, stack]) => [
        player,
        stack.map((bitmapId) => describeCardForSnapshot(bitmapId)),
      ]),
    ),
    userHand: state.hand.map((bitmapId) => describeCardForSnapshot(bitmapId)),
    currentTurn: {
      player: getCurrentPlayer(),
      isUserTurn: isUserTurn(),
    },
    actionState: {
      waitingForResponse: actionState.waitingForResponse,
      waitingForUserPass: actionState.waitingForUserPass,
      sequenceLock: actionState.sequenceLock,
      userResponding: actionState.userResponding,
      controlledResponder: actionState.controlledResponder,
      userTrickTurnPosition: getTrickTurnPosition("jugador"),
      userCanCallEnvidoFromSeat: canPlayerCallEnvidoNow("jugador"),
      userCanInterruptTruco: actionState.userCanInterruptTruco,
      userCanRaiseRealEnvido: actionState.userCanRaiseRealEnvido,
      userCanRaiseFaltaEnvido: actionState.userCanRaiseFaltaEnvido,
      canCounterPendingTruco: actionState.canCounterPendingTruco,
      canCallTruco: actionState.canCallTruco,
      canCallEnvidoNow: actionState.canCallEnvidoNow,
      canInterruptWithEnvido: actionState.canInterruptWithEnvido,
      visibleButtons: { ...actionState.visible },
      visibleButtonNames,
      currentTrucoState: getTrucoCallState("jugador"),
    },
    round,
  };
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.append(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();

  if (!copied) {
    throw new Error("Clipboard copy command failed.");
  }
}

async function copyGameSnapshot() {
  const payload = JSON.stringify(buildGameSnapshot(), null, 2);
  try {
    await copyTextToClipboard(payload);
    updateCallout("ESTADO COPIADO AL PORTAPAPELES");
  } catch (error) {
    console.warn("Could not copy game snapshot.", error);
    updateCallout("NO SE PUDO COPIAR EL ESTADO");
  }
}

function attachAudioControls() {
  renderAudioControls();
  applyVoiceAudioSettings();
  applyMusicAudioSettings();

  musicMuteInput?.addEventListener("change", () => {
    audioSettings.musicMuted = musicMuteInput.checked;
    saveAudioSettings();
    renderAudioControls();
    applyMusicAudioSettings();
  });

  musicVolumeInput?.addEventListener("input", () => {
    audioSettings.musicVolume = clamp(Number(musicVolumeInput.value), 0, 100);
    saveAudioSettings();
    renderAudioControls();
    applyMusicAudioSettings();
  });

  voiceMuteInput?.addEventListener("change", () => {
    audioSettings.voiceMuted = voiceMuteInput.checked;
    saveAudioSettings();
    renderAudioControls();
    applyVoiceAudioSettings();
  });

  voiceVolumeInput?.addEventListener("input", () => {
    audioSettings.voiceVolume = clamp(Number(voiceVolumeInput.value), 0, 100);
    saveAudioSettings();
    renderAudioControls();
    applyVoiceAudioSettings();
  });
}

function attachSeedControls() {
  document.getElementById("btn-seed-apply").addEventListener("click", applySeedFromInput);
  document.getElementById("btn-seed-random").addEventListener("click", () => {
    const nextSeed = createRandomSeed();
    setMatchSeed(nextSeed);
    updateCallout(`SEED ${nextSeed} CARGADO`);
    if (state.manifest) {
      newMatch();
    }
  });
  seedInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      applySeedFromInput();
    }
  });
  document.getElementById("btn-copy-state").addEventListener("click", () => {
    void copyGameSnapshot();
  });
}

function attachLiveReload() {
  if (runtimeConfig.liveReload === false) {
    return;
  }

  if (!("EventSource" in window)) {
    return;
  }

  liveReloadSource = new EventSource("/__live");
  liveReloadSource.onmessage = () => {
    window.location.reload();
  };
}

function setSeedAndRestart(seed) {
  const normalized = normalizeSeed(seed);
  if (!normalized) {
    updateCallout("INGRESA UN SEED VALIDO");
    return false;
  }

  setMatchSeed(normalized);
  updateCallout(`SEED ${normalized} CARGADO`);
  if (state.manifest) {
    newMatch();
  }
  return true;
}

function exposeRetrucoApi() {
  window.RETRUCO_API = {
    ready: () => manifestLoadPromise ?? Promise.resolve(),
    getSnapshot: () => buildGameSnapshot(),
    copyState: () => copyGameSnapshot(),
    newMatch: () => newMatch(),
    newHand: () => newHand(),
    choosePartner: () => openPartnerChooser(),
    showSplash: () => showSplashScreen(),
    showTable: () => showTableScreen(),
    showInspector: () => showOverlay("inspector"),
    showAbout: () => showOverlay("about"),
    stopAudio: () => stopAllAudio("Audio detenido."),
    setSeed: (seed) => setSeedAndRestart(seed),
  };
}

function applyRuntimeConfig() {
  document.body.classList.toggle("widget-frame-mode", widgetFrameMode);
  const helpContactBase = runtimeConfig.helpContactBase ?? "/reverse_engineering/contact/";
  if (helpLinks.cards) {
    helpLinks.cards.href = `${helpContactBase}card-sheet-labeled.png`;
  }
  if (helpLinks.resources) {
    helpLinks.resources.href = `${helpContactBase}all-bitmaps.png`;
  }
}

function attachActions() {
  document.querySelectorAll("[data-action]").forEach((node) => {
    node.addEventListener("click", () => {
      const action = node.dataset.action;
      closeMenus();

      if (action === "new-hand") {
        newMatch();
      }

      if (action === "choose-partner") {
        openPartnerChooser();
      }

      if (action === "show-splash") {
        showSplashScreen();
      }

      if (action === "show-table") {
        showTableScreen();
      }

      if (action === "about") {
        showOverlay("about");
      }

      if (action === "close-about") {
        hideOverlay("about");
      }

      if (action === "show-inspector") {
        showOverlay("inspector");
      }

      if (action === "close-inspector") {
        hideOverlay("inspector");
      }

      if (action === "play-selected-sound") {
        playSelectedSound();
      }

      if (action === "play-main-midi") {
        playMainMidi();
      }

      if (action === "stop-audio") {
        stopAllAudio("Audio detenido.");
      }
    });
  });

  document.getElementById("btn-new-game").addEventListener("click", newMatch);
  document.getElementById("btn-next").addEventListener("click", () => {
    if (state.round && !state.round.roundOver) {
      updateCallout("TERMINA LA MANO ACTUAL PRIMERO");
      return;
    }

    newHand();
  });
  document.getElementById("btn-truco").addEventListener("click", () => {
    const controlledResponder = getUserControlledResponder();
    if (controlledResponder && raisePendingTruco(controlledResponder)) {
      return;
    }

    callTruco("jugador");
  });
  document.getElementById("btn-mazo").addEventListener("click", () => {
    if (!state.round || state.round.roundOver) {
      announceCall("meVoyAlMazo", "ME VOY AL MAZO");
      return;
    }

    if (state.round.pendingCall || isSequenceLocked()) {
      updateCallout("RESUELVE LA CANTADA ACTUAL PRIMERO");
      return;
    }

    announcePlayerLine(
      "jugador",
      callText("meVoyAlMazo", "ME VOY AL MAZO"),
      getActionVoiceSequence("meVoyAlMazo"),
    );
    const winnerTeam = getTeamForPlayer("jugador") === "teamOne" ? "teamTwo" : "teamOne";
    endRound(winnerTeam, `${callText("meVoyAlMazo", "ME VOY AL MAZO")} - ${winnerTeam === "teamOne" ? "EQUIPO UNO" : "EQUIPO DOS"}`);
  });
  document.getElementById("btn-paso").addEventListener("click", () => {
    if (userPassEnvidoReveal()) {
      return;
    }

    announceCall("paso", "PASO");
  });
  document.getElementById("btn-quiero").addEventListener("click", () => {
    const controlledResponder = getUserControlledResponder() ?? "jugador";
    if (resolvePendingCallResponse(controlledResponder, true)) {
      return;
    }

    announceCall("quiero", "QUIERO");
  });
  document.getElementById("btn-no-quiero").addEventListener("click", () => {
    const controlledResponder = getUserControlledResponder() ?? "jugador";
    if (resolvePendingCallResponse(controlledResponder, false)) {
      return;
    }

    announceCall("noQuiero", "NO QUIERO");
  });
  document.getElementById("btn-envido").addEventListener("click", () => {
    callEnvido(getUserControlledResponder() ?? "jugador", "envido");
  });
  document.getElementById("btn-real-envido").addEventListener("click", () => {
    const controlledResponder = getUserControlledResponder() ?? "jugador";
    if (raisePendingEnvido(controlledResponder, "realEnvido")) {
      return;
    }

    callEnvido(controlledResponder, "realEnvido");
  });
  document.getElementById("btn-falta-envido").addEventListener("click", () => {
    const controlledResponder = getUserControlledResponder() ?? "jugador";
    if (raisePendingEnvido(controlledResponder, "faltaEnvido")) {
      return;
    }

    callEnvido(controlledResponder, "faltaEnvido");
  });

  bitmapPicker.addEventListener("change", () => {
    renderBitmapPreview(bitmapPicker.value);
  });

  soundPicker.addEventListener("change", () => {
    audioNote.textContent = soundPicker.value
      ? `Seleccionado ${soundPicker.value}.`
      : "Select a recovered sound resource.";
  });
}

async function loadManifest() {
  try {
    const response = await fetch(asset("resource-manifest.json"));
    if (!response.ok) {
      throw new Error(`Manifest request failed with ${response.status}`);
    }

    state.manifest = await response.json();
    renderMatchScore();
    renderInspector();
    renderHand();
    renderTableCards();
    renderActionButtons();
  } catch (error) {
    renderInspector();
    console.error(error);
  }
}

setSelectPlaceholder(bitmapPicker, "loading manifest...");
setSelectPlaceholder(soundPicker, "loading manifest...");

initializeSeed();
updateSeating();
renderPortraits();
renderButtons();
renderPartnerDialog();
clearSpeechLines();
renderMatchScore();
renderHand();
renderTableCards();
renderSeedPanel();
applyRuntimeConfig();
attachMenuBehavior();
attachOverlayBehavior();
attachAudioUnlock();
attachAudioControls();
attachSeedControls();
attachActions();
attachLiveReload();
setScreen("splash");
showOverlay("partner");
manifestLoadPromise = loadManifest();
exposeRetrucoApi();

window.addEventListener("beforeunload", () => {
  clearRoundTimer(state.round);
  stopBackgroundMusic();
  stopAllAudio("Audio detenido.");
  liveReloadSource?.close();
});
