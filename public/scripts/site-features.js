const themeStorageKey = "ericos95-theme";
const darkToggle = document.getElementById("darkModeToggle");
const postFeedStatus = document.getElementById("postFeedStatus");
const postFeedSentinel = document.getElementById("postFeedSentinel");
const postsFeed = document.getElementById("postsFeed");
const cookieWidget = document.getElementById("cookieWidget");
const cookieAccept = document.getElementById("cookieAccept");
const cookieDecline = document.getElementById("cookieDecline");
const myComputerIcon = document.getElementById("myComputerIcon");
const myComputerWidget = document.getElementById("myComputerWidget");
const computerRequest = document.getElementById("computerRequest");
const computerCancel = document.getElementById("computerCancel");
const requestResultWidget = document.getElementById("requestResultWidget");
const requestResultOk = document.getElementById("requestResultOk");
const guestbookLink = document.getElementById("guestbookLink");
const guestbookWidget = document.getElementById("guestbookWidget");
const guestbookOk = document.getElementById("guestbookOk");
const emailLink = document.getElementById("emailLink");
const startMenuEmailLink = document.getElementById("startMenuEmailLink");
const emailWidget = document.getElementById("emailWidget");
const emailOk = document.getElementById("emailOk");
const shutdownMenuItem = document.getElementById("shutdownMenuItem");
const shutdownConfirmWidget = document.getElementById("shutdownConfirmWidget");
const shutdownYes = document.getElementById("shutdownYes");
const shutdownNo = document.getElementById("shutdownNo");
const shutdownWidget = document.getElementById("shutdownWidget");
const shutdownOk = document.getElementById("shutdownOk");
const startMenuEl = document.getElementById("startMenu");
const darkToggleRow = darkToggle?.closest(".dark-toggle");
const darkToggleLabel = document.querySelector('label[for="darkModeToggle"]');
const browserContent = document.getElementById("browserContent");
const browserAddress = document.getElementById("browserAddress");
const browserWindowTitle = document.getElementById("browserWindowTitle");
const browserHomeTemplate = document.getElementById("browserHomeTemplate");
const browserNotFoundTemplate = document.getElementById("browserNotFoundTemplate");
const cmdShell = document.getElementById("cmdShell");
const cmdEntry = document.getElementById("cmdEntry");
const cmdOutput = document.getElementById("cmdOutput");
const retrucoWindow = document.getElementById("retruco");
const retrucoWidgetHost = document.getElementById("retrucoWidgetHost");
const retrucoMenuBar = document.getElementById("retrucoMenuBar");
const projectsWindow = document.getElementById("projects");
const clippyAssistant = document.getElementById("clippyAssistant");
const clippyBalloon = document.getElementById("clippyBalloon");
const clippyMessage = document.getElementById("clippyMessage");
const clippyLink = document.getElementById("clippyLink");
const clippySecondaryLink = document.getElementById("clippySecondaryLink");
const clippyClose = document.getElementById("clippyClose");
const clippyImage = document.querySelector("#clippyAssistant .clippy-image");
const consentCookieName = "ericos95_cookie_consent";
const desktopRoot = document.querySelector(".desktop");
const dialogs = [
  cookieWidget,
  myComputerWidget,
  requestResultWidget,
  guestbookWidget,
  emailWidget,
  shutdownConfirmWidget,
  shutdownWidget
].filter(Boolean);
let dialogZ = 60;
let retrucoWidgetPromise = null;
const shownClippyTopics = new Set();
let activeClippyContext = "";
let dismissedClippyContext = "";
const CLIPPY_SPRITE_COLUMNS = 27;
const CLIPPY_SPRITE_ROWS = 34;
const CLIPPY_IDLE_ANIMATIONS = [
  "RestPose",
  "LookLeft",
  "LookRight",
  "LookUp",
  "LookDown",
  "LookUpLeft",
  "LookUpRight",
  "LookDownLeft",
  "LookDownRight",
  "Wave",
  "Idle1_1",
  "IdleAtom",
  "IdleEyeBrowRaise",
  "IdleFingerTap",
  "IdleHeadScratch",
  "IdleRopePile",
  "IdleSideToSide",
  "IdleSnooze",
  "Searching",
  "Thinking",
  "IdleEyeBrowRaise"
];
const CLIPPY_GREETING_ANIMATIONS = ["Greeting", "Show", "Wave", "GetAttention"];
const CLIPPY_FUN_ANIMATIONS = [
  "Wave",
  "Congratulate",
  "GetAttention",
  "GestureLeft",
  "GestureRight",
  "GestureUp",
  "GestureDown",
  "GetWizardy",
  "GetTechy",
  "GetArtsy",
  "CheckingSomething",
  "Thinking",
  "Explain"
];
const RETRUCO_NATIVE_WIDTH = 640;
const RETRUCO_NATIVE_HEIGHT = 580;
const homeBrowserAddress = "https://eric.cast.ro";
const homeBrowserTitle = "https://eric.cast.ro - Microsoff Internet Ersplorer";
const homeDocumentTitle = document.title;
const homeBrowserContent = browserHomeTemplate?.innerHTML ?? browserContent?.innerHTML ?? "";
const homeBrowserOrigin = new URL(homeBrowserAddress).origin;
let currentBrowserAddress = homeBrowserAddress;
let clippyAnimationsPromise = null;
let clippyAnimationsByName = new Map();
let clippyAnimationTimeout = null;
let clippyAnimationToken = 0;
let clippyLastFrameOffsets = { Column: 0, Row: 0 };
let clippyClickTimer = null;
let clippySuppressClickUntil = 0;

function isPrimaryPointer(event) {
  return event.isPrimary !== false && (event.pointerType === "touch" || event.button === 0);
}

function bindTapActivation(element, handler) {
  if (!element) return;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchActivatedAt = 0;

  element.addEventListener(
    "touchstart",
    (event) => {
      const touch = event.changedTouches?.[0];
      if (!touch) return;
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    },
    { passive: true }
  );

  element.addEventListener("touchend", (event) => {
    const touch = event.changedTouches?.[0];
    if (!touch) return;
    const movedX = Math.abs(touch.clientX - touchStartX);
    const movedY = Math.abs(touch.clientY - touchStartY);
    if (movedX > 10 || movedY > 10) return;
    touchActivatedAt = Date.now();
    handler(event);
  });

  element.addEventListener("click", (event) => {
    if (Date.now() - touchActivatedAt < 700) return;
    handler(event);
  });
}

function centerDialog(dialog) {
  if (!dialog || !desktopRoot) return;
  const width = dialog.offsetWidth;
  const height = dialog.offsetHeight;
  const left = Math.max(0, Math.round((desktopRoot.clientWidth - width) / 2));
  const top = Math.max(0, Math.round((desktopRoot.clientHeight - height) / 2));
  dialog.style.left = `${left}px`;
  dialog.style.top = `${top}px`;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => {
    if (char === "&") return "&amp;";
    if (char === "<") return "&lt;";
    if (char === ">") return "&gt;";
    if (char === '"') return "&quot;";
    return "&#39;";
  });
}

function setBrowserChrome(nextUrl, nextDocumentTitle = homeDocumentTitle) {
  currentBrowserAddress = nextUrl;
  if (browserAddress) {
    browserAddress.textContent = nextUrl;
  }
  if (browserWindowTitle) {
    browserWindowTitle.textContent = `${nextUrl} - Microsoff Internet Ersplorer`;
  }
  document.title = nextDocumentTitle;
}

function showDialog(dialog) {
  if (!dialog) return;
  dialogs.forEach((candidate) => candidate.classList.remove("active"));
  const topWindowZ = Math.max(
    0,
    ...Array.from(document.querySelectorAll("[data-window]")).map((windowEl) =>
      Number(windowEl.style.zIndex || 0)
    )
  );
  dialog.style.zIndex = String(Math.max(dialogZ++, topWindowZ + 5));
  dialog.classList.remove("is-hidden");
  dialog.classList.add("active");
  centerDialog(dialog);
}

function hideDialog(dialog) {
  if (!dialog) return;
  dialog.classList.add("is-hidden");
  dialog.classList.remove("active");
}

function hideClippyBalloon() {
  clippyBalloon?.classList.add("is-hidden");
  clippyLink?.classList.add("is-hidden");
  clippySecondaryLink?.classList.add("is-hidden");
}

function normalizeClippyMessage(message = "") {
  return String(message).replace(/\\n/g, "\n");
}

function formatClippyMessage(message = "") {
  const normalized = normalizeClippyMessage(message);
  const parts = normalized.split("**");
  const html = parts
    .map((part, index) => {
      const escaped = escapeHtml(part).replace(/\n/g, "<br>");
      return index % 2 === 1 ? `<strong>${escaped}</strong>` : escaped;
    })
    .join("");
  return html;
}

function applyClippySpriteMetrics() {
  if (!clippyImage) return;
  const frameWidth = clippyImage.clientWidth || 111;
  const frameHeight = clippyImage.clientHeight || 91;
  clippyImage.style.backgroundSize = `${frameWidth * CLIPPY_SPRITE_COLUMNS}px ${frameHeight * CLIPPY_SPRITE_ROWS}px`;
}

function setClippyFrame(offsets) {
  if (!clippyImage) return;
  const frame = offsets ?? clippyLastFrameOffsets ?? { Column: 0, Row: 0 };
  if (offsets) {
    clippyLastFrameOffsets = offsets;
  }

  applyClippySpriteMetrics();
  const frameWidth = clippyImage.clientWidth || 111;
  const frameHeight = clippyImage.clientHeight || 91;
  clippyImage.style.backgroundPosition = `${-frame.Column * frameWidth}px ${-frame.Row * frameHeight}px`;
}

async function loadClippyAnimations() {
  if (!clippyImage) return new Map();
  if (!clippyAnimationsPromise) {
    clippyAnimationsPromise = fetch("/clippy/animations.json")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load Clippy animations.");
        return response.json();
      })
      .then((animations) => {
        clippyAnimationsByName = new Map(
          Array.isArray(animations) ? animations.map((animation) => [animation.Name, animation]) : []
        );
        return clippyAnimationsByName;
      })
      .catch((error) => {
        console.error(error);
        clippyAnimationsByName = new Map();
        return clippyAnimationsByName;
      });
  }

  return clippyAnimationsPromise;
}

function clearClippyAnimationTimer() {
  if (clippyAnimationTimeout) {
    clearTimeout(clippyAnimationTimeout);
    clippyAnimationTimeout = null;
  }
}

function runClippyAnimation(name, { onDone } = {}) {
  const animation = clippyAnimationsByName.get(name);
  if (!animation || !Array.isArray(animation.Frames) || !animation.Frames.length) return false;

  clippyAnimationToken += 1;
  const token = clippyAnimationToken;
  clearClippyAnimationTimer();

  let frameIndex = 0;

  function step() {
    if (token !== clippyAnimationToken) return;
    const frame = animation.Frames[frameIndex];
    if (!frame) {
      onDone?.();
      return;
    }

    if (frame.ImagesOffsets) {
      setClippyFrame(frame.ImagesOffsets);
    }

    frameIndex += 1;
    if (frameIndex >= animation.Frames.length) {
      clippyAnimationTimeout = window.setTimeout(() => {
        if (token !== clippyAnimationToken) return;
        onDone?.();
      }, Math.max(16, frame.Duration ?? 100));
      return;
    }

    clippyAnimationTimeout = window.setTimeout(step, Math.max(16, frame.Duration ?? 100));
  }

  step();
  return true;
}

function scheduleNextClippyIdle(delay = 400) {
  clearClippyAnimationTimer();
  clippyAnimationTimeout = window.setTimeout(() => {
    playRandomClippyIdle();
  }, delay);
}

function pickRandomClippyAnimation(names = CLIPPY_IDLE_ANIMATIONS) {
  const availableNames = names.filter((name) => clippyAnimationsByName.has(name));
  if (!availableNames.length) return null;
  const currentName = clippyImage?.dataset.clippyAnimation || "";
  const pool =
    availableNames.length > 1 ? availableNames.filter((name) => name !== currentName) : availableNames;
  return pool[Math.floor(Math.random() * pool.length)] ?? availableNames[0];
}

function playRandomClippyIdle() {
  const nextAnimation = pickRandomClippyAnimation(CLIPPY_IDLE_ANIMATIONS);
  if (!nextAnimation) return;
  if (clippyImage) {
    clippyImage.dataset.clippyAnimation = nextAnimation;
  }
  runClippyAnimation(nextAnimation, {
    onDone: () => scheduleNextClippyIdle(2200 + Math.floor(Math.random() * 2600))
  });
}

async function initializeClippyAnimator() {
  if (!clippyImage) return;
  setClippyFrame({ Column: 0, Row: 0 });
  await loadClippyAnimations();
  if (!clippyAnimationsByName.size) return;

  const initialAnimation =
    pickRandomClippyAnimation(CLIPPY_GREETING_ANIMATIONS) ??
    pickRandomClippyAnimation(CLIPPY_IDLE_ANIMATIONS);
  if (!initialAnimation) return;
  clippyImage.dataset.clippyAnimation = initialAnimation;
  runClippyAnimation(initialAnimation, {
    onDone: () => scheduleNextClippyIdle(2400)
  });
}

function showClippyHint(topic, { message, href = "", label = "", secondary, once = true } = {}) {
  if (!clippyBalloon || !clippyMessage || !clippyLink || !clippySecondaryLink) return;
  if (once && shownClippyTopics.has(topic)) return;
  if (once) {
    shownClippyTopics.add(topic);
  }

  clippyMessage.innerHTML = formatClippyMessage(message);

  if (href && label) {
    clippyLink.href = href;
    clippyLink.textContent = label;
    clippyLink.classList.remove("is-hidden");
  } else {
    clippyLink.classList.add("is-hidden");
    clippyLink.removeAttribute("href");
    clippyLink.textContent = "";
  }

  if (secondary?.href && secondary?.label) {
    clippySecondaryLink.href = secondary.href;
    clippySecondaryLink.textContent = secondary.label;
    clippySecondaryLink.classList.remove("is-hidden");
  } else {
    clippySecondaryLink.classList.add("is-hidden");
    clippySecondaryLink.removeAttribute("href");
    clippySecondaryLink.textContent = "";
  }

  clippyBalloon.classList.remove("is-hidden");
}

function triggerClippyHint(topic, options = {}) {
  if (options.animation && clippyAnimationsByName.has(options.animation)) {
    if (clippyImage) {
      clippyImage.dataset.clippyAnimation = options.animation;
    }
    runClippyAnimation(options.animation, {
      onDone: () => scheduleNextClippyIdle(500)
    });
  }
  showClippyHint(topic, options);
}

function showClippyAboutHint() {
  triggerClippyHint("clippy-about", {
    message:
      "I'm Clippy, EricOS 95 assistant.\n\nBack when I was working at Microsoft, I was always eager to help but users simply wanted me out of their sight.\n\nMicrosoft fired me in 2003.\n\nEric gave me a job again.",
    href: "/posts/2026-04-16-clippy-got-a-new-job/",
    label: "Click here to read the full story",
    secondary: {
      href: "clippy:goodbye",
      label: "Are you also going to ask me to leave?"
    },
    once: false,
    animation: "Explain"
  });
}

function playRandomClippyFunAnimation() {
  const nextAnimation = pickRandomClippyAnimation(CLIPPY_FUN_ANIMATIONS);
  if (!nextAnimation) return false;
  if (clippyImage) {
    clippyImage.dataset.clippyAnimation = nextAnimation;
  }
  return runClippyAnimation(nextAnimation, {
    onDone: () => scheduleNextClippyIdle(2200)
  });
}

function getClippyDescriptorFromElement(element) {
  if (!(element instanceof HTMLElement)) return null;
  const message = element.dataset.clippyMessage?.trim();
  if (!message) return null;
  return {
    topic: element.dataset.clippyTopic || element.id || "general",
    message,
    href: element.dataset.clippyHref || "",
    label: element.dataset.clippyLabel || "",
    secondary:
      element.dataset.clippySecondaryHref && element.dataset.clippySecondaryLabel
        ? {
            href: element.dataset.clippySecondaryHref,
            label: element.dataset.clippySecondaryLabel
          }
        : undefined,
    once: false
  };
}

function applyBrowserClippyDescriptor(source) {
  if (!browserContent) return;

  delete browserContent.dataset.clippyTopic;
  delete browserContent.dataset.clippyMessage;
  delete browserContent.dataset.clippyHref;
  delete browserContent.dataset.clippyLabel;
  delete browserContent.dataset.clippySecondaryHref;
  delete browserContent.dataset.clippySecondaryLabel;

  if (!(source instanceof HTMLElement)) return;

  if (source.dataset.clippyTopic) {
    browserContent.dataset.clippyTopic = source.dataset.clippyTopic;
  }
  if (source.dataset.clippyMessage) {
    browserContent.dataset.clippyMessage = source.dataset.clippyMessage;
  }
  if (source.dataset.clippyHref) {
    browserContent.dataset.clippyHref = source.dataset.clippyHref;
  }
  if (source.dataset.clippyLabel) {
    browserContent.dataset.clippyLabel = source.dataset.clippyLabel;
  }
  if (source.dataset.clippySecondaryHref) {
    browserContent.dataset.clippySecondaryHref = source.dataset.clippySecondaryHref;
  }
  if (source.dataset.clippySecondaryLabel) {
    browserContent.dataset.clippySecondaryLabel = source.dataset.clippySecondaryLabel;
  }
}

function getClippyContextKey(descriptor) {
  if (!descriptor) return "";
  return [descriptor.topic, descriptor.message, descriptor.href || "", descriptor.label || ""].join("|");
}

function getActiveClippyDescriptor() {
  const activeWindow = document.querySelector("[data-window].active:not(.hidden)");
  if (!(activeWindow instanceof HTMLElement)) return null;

  if (activeWindow.id === "browser") {
    return getClippyDescriptorFromElement(browserContent);
  }

  return getClippyDescriptorFromElement(activeWindow);
}

function syncContextualClippy() {
  const descriptor = getActiveClippyDescriptor();
  const nextContext = getClippyContextKey(descriptor);

  if (nextContext !== activeClippyContext) {
    dismissedClippyContext = "";
  }

  activeClippyContext = nextContext;

  if (!descriptor) {
    hideClippyBalloon();
    return;
  }

  if (dismissedClippyContext && dismissedClippyContext === nextContext) {
    hideClippyBalloon();
    return;
  }

  showClippyHint(descriptor.topic, descriptor);
}

function initializeClippyDrag() {
  if (!clippyAssistant || !clippyImage || !desktopRoot) return;

  let dragState = null;
  let movedDuringDrag = false;

  function updatePosition(clientX, clientY) {
    if (!dragState) return;

    const maxLeft = Math.max(0, desktopRoot.clientWidth - dragState.width);
    const maxTop = Math.max(0, desktopRoot.clientHeight - dragState.height);
    const left = Math.min(maxLeft, Math.max(0, Math.round(clientX - dragState.offsetX)));
    const top = Math.min(maxTop, Math.max(0, Math.round(clientY - dragState.offsetY)));

    clippyAssistant.style.left = `${left}px`;
    clippyAssistant.style.top = `${top}px`;
    clippyAssistant.style.right = "auto";
    clippyAssistant.style.bottom = "auto";
  }

  clippyImage.addEventListener("pointerdown", (event) => {
    if (!isPrimaryPointer(event)) return;
    const assistantRect = clippyAssistant.getBoundingClientRect();
    const desktopRect = desktopRoot.getBoundingClientRect();
    movedDuringDrag = false;

    dragState = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      offsetX: event.clientX - assistantRect.left,
      offsetY: event.clientY - assistantRect.top,
      width: assistantRect.width,
      height: assistantRect.height,
      desktopLeft: desktopRect.left,
      desktopTop: desktopRect.top
    };

    clippyImage.setPointerCapture(event.pointerId);
    clippyAssistant.classList.add("is-dragging");
    event.preventDefault();
  });

  clippyImage.addEventListener("pointermove", (event) => {
    if (!dragState || event.pointerId !== dragState.pointerId) return;
    if (
      Math.abs(event.clientX - dragState.startClientX) > 3 ||
      Math.abs(event.clientY - dragState.startClientY) > 3
    ) {
      movedDuringDrag = true;
    }
    updatePosition(
      event.clientX - dragState.desktopLeft,
      event.clientY - dragState.desktopTop
    );
  });

  function endDrag(event) {
    if (!dragState || event.pointerId !== dragState.pointerId) return;
    clippyAssistant.classList.remove("is-dragging");
    if (movedDuringDrag) {
      clippySuppressClickUntil = Date.now() + 300;
    }
    try {
      clippyImage.releasePointerCapture(event.pointerId);
    } catch {}
    dragState = null;
  }

  clippyImage.addEventListener("pointerup", endDrag);
  clippyImage.addEventListener("pointercancel", endDrag);

  clippyImage.addEventListener("click", (event) => {
    if (Date.now() < clippySuppressClickUntil) {
      event.preventDefault();
      return;
    }
    if (clippyClickTimer) {
      clearTimeout(clippyClickTimer);
      clippyClickTimer = null;
    }
    clippyClickTimer = window.setTimeout(() => {
      showClippyAboutHint();
      clippyClickTimer = null;
    }, 220);
  });

  clippyImage.addEventListener("dblclick", (event) => {
    if (Date.now() < clippySuppressClickUntil) {
      event.preventDefault();
      return;
    }
    if (clippyClickTimer) {
      clearTimeout(clippyClickTimer);
      clippyClickTimer = null;
    }
    event.preventDefault();
    playRandomClippyFunAnimation();
  });
}

function applyTheme(theme) {
  document.body.classList.toggle("theme-dark", theme === "dark");
  if (darkToggle) {
    darkToggle.checked = theme === "dark";
  }
}

function initializeTheme() {
  const savedTheme = localStorage.getItem(themeStorageKey) ?? "light";
  applyTheme(savedTheme);

  if (!darkToggle) return;
  darkToggle.addEventListener("change", () => {
    const nextTheme = darkToggle.checked ? "dark" : "light";
    localStorage.setItem(themeStorageKey, nextTheme);
    applyTheme(nextTheme);
  });

  function toggleThemeFromTap(event) {
    if (event.target === darkToggle) return;
    event.preventDefault();
    darkToggle.checked = !darkToggle.checked;
    darkToggle.dispatchEvent(new Event("change", { bubbles: true }));
  }

  bindTapActivation(darkToggleRow, (event) => {
    toggleThemeFromTap(event);
  });
}

function getCookie(name) {
  const cookies = document.cookie ? document.cookie.split("; ") : [];
  const match = cookies.find((cookie) => cookie.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
}

function setCookie(name, value, maxAgeSeconds) {
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax`;
}

function initializeCookieWidget() {
  if (!cookieWidget || !cookieAccept || !cookieDecline) return;

  const savedConsent = getCookie(consentCookieName);
  if (savedConsent === "accepted") {
    hideDialog(cookieWidget);
    return;
  }

  showDialog(cookieWidget);

  function acceptConsent() {
    setCookie(consentCookieName, "accepted", 60 * 60 * 24 * 365);
    hideDialog(cookieWidget);
  }

  function declineConsent() {
    hideDialog(cookieWidget);
  }

  bindTapActivation(cookieAccept, acceptConsent);
  bindTapActivation(cookieDecline, declineConsent);
}

function initializeMyComputerWidget() {
  if (!myComputerIcon || !myComputerWidget || !computerRequest || !computerCancel) return;

  function openWidget(event) {
    event?.preventDefault?.();
    showDialog(myComputerWidget);
  }

  function closeWidget() {
    hideDialog(myComputerWidget);
  }

  myComputerIcon.addEventListener("dblclick", openWidget);
  myComputerIcon.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    openWidget(event);
  });

  bindTapActivation(computerRequest, () => {
    closeWidget();
    showDialog(requestResultWidget);
  });
  bindTapActivation(computerCancel, closeWidget);

  bindTapActivation(requestResultOk, () => {
    hideDialog(requestResultWidget);
  });
}

function initializeGuestbookWidget() {
  if (!guestbookLink || !guestbookWidget || !guestbookOk) return;

  bindTapActivation(guestbookLink, (event) => {
    event.preventDefault();
    showDialog(guestbookWidget);
  });

  bindTapActivation(guestbookOk, () => {
    hideDialog(guestbookWidget);
  });
}

function initializeEmailWidget() {
  if (!emailWidget || !emailOk) return;

  function openWidget(event) {
    event.preventDefault();
    showDialog(emailWidget);
  }

  if (emailLink) {
    bindTapActivation(emailLink, openWidget);
  }

  if (startMenuEmailLink) {
    bindTapActivation(startMenuEmailLink, openWidget);
  }

  bindTapActivation(emailOk, () => {
    hideDialog(emailWidget);
  });
}

function initializeShutdownWidget() {
  if (
    !shutdownMenuItem ||
    !shutdownConfirmWidget ||
    !shutdownYes ||
    !shutdownNo ||
    !shutdownWidget ||
    !shutdownOk
  ) {
    return;
  }

  bindTapActivation(shutdownMenuItem, () => {
    if (typeof window.setStartMenuOpen === "function") {
      window.setStartMenuOpen(false);
    } else {
      startMenuEl?.classList.add("hidden");
    }
    showDialog(shutdownConfirmWidget);
  });

  bindTapActivation(shutdownYes, () => {
    hideDialog(shutdownConfirmWidget);
    document.body.classList.add("shutdown-mode");
    showDialog(shutdownWidget);
  });

  bindTapActivation(shutdownNo, () => {
    hideDialog(shutdownConfirmWidget);
  });

  bindTapActivation(shutdownOk, () => {
    hideDialog(shutdownWidget);
  });
}

function placeCaretAtEnd(element) {
  if (!element) return;
  const selection = window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

function appendCmdResponse(command) {
  if (!cmdOutput || !cmdEntry || !cmdShell) return;
  const trimmedCommand = command.replace(/\s+/g, " ").trim();
  if (!trimmedCommand) return;

  const block = document.createElement("div");
  block.className = "cmd-response";
  block.innerHTML =
    `<span class="prompt">C:\\&gt;</span> ${trimmedCommand}\nTask failed successfully.\n`;
  cmdOutput.appendChild(block);
  cmdEntry.textContent = "";
  cmdShell.scrollTop = cmdShell.scrollHeight;
  placeCaretAtEnd(cmdEntry);
}

function initializeCmdWidget() {
  if (!cmdShell || !cmdEntry || !cmdOutput) return;

  function focusEntry() {
    cmdEntry.focus();
    placeCaretAtEnd(cmdEntry);
  }

  cmdShell.addEventListener("pointerdown", (event) => {
    if (event.target instanceof HTMLElement && event.target.closest(".cmd-entry")) return;
    window.setTimeout(focusEntry, 0);
  });

  cmdEntry.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    appendCmdResponse(cmdEntry.textContent || "");
  });

  requestAnimationFrame(() => {
    cmdShell.scrollTop = cmdShell.scrollHeight;
  });
}

function closeRetrucoMenus() {
  if (!retrucoMenuBar) return;
  retrucoMenuBar
    .querySelectorAll(".retruco-menu-panel")
    .forEach((panel) => panel.classList.add("is-hidden"));
  retrucoMenuBar
    .querySelectorAll("[data-retruco-menu-toggle]")
    .forEach((toggle) => toggle.setAttribute("aria-expanded", "false"));
}

function patchRetrucoFrame(widget) {
  const frameDocument = widget?.frame?.contentDocument;
  if (!frameDocument || frameDocument.getElementById("ericos95-retruco-patch")) return;

  const style = frameDocument.createElement("style");
  style.id = "ericos95-retruco-patch";
  style.textContent = `
    body.widget-frame-mode .desktop {
      justify-items: center !important;
      overflow: hidden !important;
    }

    body.widget-frame-mode .window-shell {
      transform: none !important;
      margin-right: 0 !important;
      margin-bottom: 0 !important;
    }
  `;

  frameDocument.head.append(style);
}

function bringRetrucoToFront() {
  window.openWindowById?.("retruco");
}

function bindRetrucoFrameActivation(widget) {
  const frame = widget?.frame;
  const frameWindow = frame?.contentWindow;
  const frameDocument = frame?.contentDocument;
  if (!(frame instanceof HTMLIFrameElement) || !frameWindow || !frameDocument) return;
  if (frame.dataset.ericos95ActivationBound === "true") return;

  const activate = () => bringRetrucoToFront();

  frame.addEventListener("pointerdown", activate);
  frame.addEventListener("mousedown", activate);
  frame.addEventListener("focus", activate);
  frameWindow.addEventListener("focus", activate);
  frameDocument.addEventListener("pointerdown", activate, true);
  frameDocument.addEventListener("mousedown", activate, true);

  frame.dataset.ericos95ActivationBound = "true";
}

function syncRetrucoFrameSize() {
  if (!retrucoWidgetHost) return;
  const root = retrucoWidgetHost.querySelector(".retruco-widget-host");
  if (!(root instanceof HTMLElement)) return;
  const frame = root.querySelector(".retruco-widget-frame");
  const availableWidth = Math.max(320, retrucoWidgetHost.clientWidth);
  const availableHeight = Math.max(260, retrucoWidgetHost.clientHeight);
  const useCompactScale = window.innerWidth <= 768;
  const compactScale = Math.min(
    1,
    availableWidth / RETRUCO_NATIVE_WIDTH,
    availableHeight / RETRUCO_NATIVE_HEIGHT
  );
  const frameScale = useCompactScale ? compactScale : 1;

  root.style.setProperty("--retruco-frame-width", `${availableWidth}px`);
  root.style.setProperty("--retruco-frame-height", `${availableHeight}px`);

  if (frame instanceof HTMLIFrameElement) {
    frame.setAttribute("scrolling", "no");
    frame.style.width = `${RETRUCO_NATIVE_WIDTH}px`;
    frame.style.height = `${RETRUCO_NATIVE_HEIGHT}px`;
    frame.style.transformOrigin = "top left";
    frame.style.transform = frameScale < 1 ? `scale(${frameScale})` : "none";
    frame.style.left = "";
  }
}

async function ensureRetrucoWidget() {
  if (!retrucoWidgetHost) return null;
  if (retrucoWidgetPromise) return retrucoWidgetPromise;

  retrucoWidgetPromise = import("/retruco/widget.js")
    .then(({ mountRetrucoWidget }) => {
      const widget = mountRetrucoWidget(retrucoWidgetHost, {
        baseUrl: "/retruco/",
        frameTitle: "RETRUCO.EXE"
      });

      window.retrucoWidget = widget;

      widget.frame?.addEventListener(
        "load",
        () => {
          patchRetrucoFrame(widget);
          bindRetrucoFrameActivation(widget);
          syncRetrucoFrameSize();
        },
        { once: true }
      );

      patchRetrucoFrame(widget);
      bindRetrucoFrameActivation(widget);
      syncRetrucoFrameSize();

      if ("ResizeObserver" in window) {
        const observer = new ResizeObserver(() => syncRetrucoFrameSize());
        observer.observe(retrucoWidgetHost);
      } else {
        window.addEventListener("resize", syncRetrucoFrameSize);
      }

      return widget;
    })
    .catch((error) => {
      console.error("Failed to mount RETRUCO widget", error);
      retrucoWidgetPromise = null;
      return null;
    });

  return retrucoWidgetPromise;
}

function initializeRetrucoWidget() {
  if (!retrucoWidgetHost || !retrucoMenuBar || !retrucoWindow) return;

  retrucoMenuBar.querySelectorAll("[data-retruco-menu-toggle]").forEach((toggle) => {
    const menuName = toggle.getAttribute("data-retruco-menu-toggle");
    const panel = retrucoMenuBar.querySelector(`[data-retruco-menu="${menuName}"]`);
    if (!menuName || !(panel instanceof HTMLElement) || !(toggle instanceof HTMLElement)) return;

    bindTapActivation(toggle, (event) => {
      event.preventDefault();
      event.stopPropagation();
      const willOpen = panel.classList.contains("is-hidden");
      closeRetrucoMenus();
      if (willOpen) {
        panel.classList.remove("is-hidden");
        toggle.setAttribute("aria-expanded", "true");
      }
    });
  });

  retrucoMenuBar.querySelectorAll("[data-retruco-action]").forEach((button) => {
    const action = button.getAttribute("data-retruco-action");
    if (!action) return;

    bindTapActivation(button, async (event) => {
      event.preventDefault();
      closeRetrucoMenus();
      const widget = await ensureRetrucoWidget();
      const method = widget?.[action];
      if (typeof method === "function") {
        method.call(widget);
      }
    });
  });

  document.addEventListener("pointerdown", (event) => {
    if (!event.target.closest("#retrucoMenuBar")) {
      closeRetrucoMenus();
    }
  });

  retrucoWindow.addEventListener("pointerdown", () => {
    void ensureRetrucoWidget();
  });

  retrucoWindow.addEventListener("desktop:window-opened", () => {
    void ensureRetrucoWidget();
  });

  retrucoWindow.addEventListener("desktop:window-closed", () => {
    closeRetrucoMenus();
    retrucoWidgetPromise?.then((widget) => widget?.destroy?.()).catch(() => {});
    retrucoWidgetHost.replaceChildren();
    retrucoWidgetPromise = null;
    window.retrucoWidget = null;
  });

  projectsWindow?.addEventListener("desktop:window-opened", syncContextualClippy);
}

function initializeClippy() {
  if (
    !clippyAssistant ||
    !clippyBalloon ||
    !clippyMessage ||
    !clippyLink ||
    !clippySecondaryLink ||
    !clippyClose
  ) {
    return;
  }

  window.triggerClippyHint = triggerClippyHint;
  window.playClippyAnimation = (name) => {
    if (!clippyAnimationsByName.has(name)) return false;
    if (clippyImage) {
      clippyImage.dataset.clippyAnimation = name;
    }
    return runClippyAnimation(name, {
      onDone: () => scheduleNextClippyIdle(500)
    });
  };
  initializeClippyDrag();
  initializeClippyAnimator();
  window.addEventListener("resize", applyClippySpriteMetrics);

  document.addEventListener("ericos95:clippy", (event) => {
    const detail = event instanceof CustomEvent ? event.detail ?? {} : {};
    const topic = detail.topic ?? "general";
    triggerClippyHint(topic, detail);
  });

  bindTapActivation(clippyClose, (event) => {
    event.preventDefault();
    dismissedClippyContext = activeClippyContext;
    hideClippyBalloon();
  });

  bindTapActivation(clippyBalloon, (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest("a, button")) return;
    dismissedClippyContext = activeClippyContext;
    hideClippyBalloon();
  });

  function handleClippyAction(linkEl, event) {
    const href = linkEl.getAttribute("href");
    if (!href) return;
    event.preventDefault();
    hideClippyBalloon();

    if (href === "clippy:goodbye") {
      triggerClippyHint("clippy-staying", {
        message: "Well, **fuck you**.\n\nI'm not going anywhere.",
        once: false
      });
      if (clippyImage) {
        clippyImage.dataset.clippyAnimation = "IdleSnooze";
      }
      runClippyAnimation("IdleSnooze", {
        onDone: () => scheduleNextClippyIdle(4000)
      });
      return;
    }

    if (href.startsWith("window:")) {
      const windowId = href.slice("window:".length);
      if (windowId) {
        window.openWindowById?.(windowId);
        window.focusWindowById?.(windowId);
        requestAnimationFrame(() => {
          window.focusWindowById?.(windowId);
        });
      }
      return;
    }

    let url;
    try {
      url = new URL(href, window.location.origin);
    } catch {
      return;
    }

    if (url.origin !== window.location.origin) {
      window.open(url.toString(), "_blank", "noopener,noreferrer");
      return;
    }

    const normalizedPath = url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`;

    if (normalizedPath === "/") {
      restoreHomeBrowser();
      return;
    }

    const postMatch = normalizedPath.match(/^\/posts\/([^/]+)\/$/);
    if (postMatch) {
      loadPostIntoBrowser(postMatch[1]).catch((error) => console.error(error));
      return;
    }

    const projectMatch = normalizedPath.match(/^\/projects\/([^/]+)\/$/);
    if (projectMatch) {
      loadProjectIntoBrowser(projectMatch[1]).catch((error) => console.error(error));
      return;
    }

    window.location.href = url.toString();
  }

  bindTapActivation(clippyLink, (event) => {
    handleClippyAction(clippyLink, event);
  });

  bindTapActivation(clippySecondaryLink, (event) => {
    handleClippyAction(clippySecondaryLink, event);
  });

  document.addEventListener("desktop:active-window-changed", syncContextualClippy);
  syncContextualClippy();
}

function initializeInfiniteScroll() {
  const postsFeed = document.getElementById("postsFeed");
  const postFeedStatus = document.getElementById("postFeedStatus");
  const postFeedSentinel = document.getElementById("postFeedSentinel");
  if (!postsFeed || !postFeedStatus || !postFeedSentinel) {
    return;
  }

  const totalPages = Number(postsFeed.dataset.totalPages || "1");
  let nextPage = Number(postsFeed.dataset.nextPage || "2");

  if (totalPages <= 1) {
    postFeedStatus.textContent = "All posts loaded.";
    if (postFeedStatus) {
      postFeedStatus.classList.remove("is-hidden");
    }
    return;
  }

  let statusTimer;
  let isLoading = false;

  function setStatus(message, { autoHide = false } = {}) {
    clearTimeout(statusTimer);
    postFeedStatus.textContent = message;
    postFeedStatus.classList.remove("is-hidden");

    if (autoHide) {
      statusTimer = window.setTimeout(() => {
        postFeedStatus.classList.add("is-hidden");
      }, 900);
    }
  }

  async function loadNextPage() {
    if (isLoading || nextPage > totalPages) return;
    isLoading = true;
    setStatus("Loading older posts...");

    try {
      const response = await fetch(`/posts/chunks/${nextPage}/`);
      if (!response.ok) throw new Error(`Failed to load page ${nextPage}`);

      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      const chunk = doc.querySelector("[data-post-chunk]");
      const postElements = chunk ? Array.from(chunk.children) : [];
      postElements.forEach((post) => postsFeed.appendChild(post));
      initializePostExternalLinks(postsFeed);

      nextPage += 1;
      postsFeed.dataset.nextPage = String(nextPage);

      if (nextPage > totalPages) {
        setStatus("All posts loaded.");
        observer.disconnect();
      } else {
        setStatus(`Loaded ${postElements.length} older post${postElements.length === 1 ? "" : "s"}.`, {
          autoHide: true
        });
      }
    } catch (error) {
      console.error(error);
      setStatus("Could not load older posts.");
    } finally {
      isLoading = false;
    }
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        loadNextPage();
      });
    },
    {
      root: document.querySelector(".ie-page"),
      rootMargin: "0px 0px 180px 0px"
    }
  );

  setStatus("Scroll down for older posts.");
  observer.observe(postFeedSentinel);
}

async function loadProjectIntoBrowser(slug, { push = true, replace = false } = {}) {
  if (!browserContent || !browserAddress || !browserWindowTitle) return;
  window.openWindowById?.("browser");

  const response = await fetch(`/project-fragments/${slug}/`);
  if (!response.ok) {
    throw new Error(`Failed to load project fragment for ${slug}`);
  }

  const html = await response.text();
  const doc = new DOMParser().parseFromString(html, "text/html");
  const fragment = doc.querySelector("[data-browser-fragment='project']");
  if (!fragment) {
    throw new Error(`Missing browser fragment for ${slug}`);
  }

  applyBrowserClippyDescriptor(fragment);
  browserContent.innerHTML = fragment.innerHTML;
  const nextUrl = fragment.getAttribute("data-browser-url") ?? `/projects/${slug}/`;
  const nextTitle = fragment.getAttribute("data-browser-title") ?? homeDocumentTitle;
  setBrowserChrome(`${homeBrowserOrigin}${nextUrl}`, nextTitle);
  syncContextualClippy();

  if (replace) {
    window.history.replaceState({ view: "project", slug }, "", nextUrl);
  } else if (push) {
    window.history.pushState({ view: "project", slug }, "", nextUrl);
  }

  document.querySelector(".ie-page")?.scrollTo({ top: 0, behavior: "auto" });
}

async function loadBlogIntoBrowser({ push = true, replace = false } = {}) {
  if (!browserContent || !browserAddress || !browserWindowTitle) return;
  window.openWindowById?.("browser");

  const response = await fetch("/blog-fragment/");
  if (!response.ok) {
    throw new Error("Failed to load blog fragment");
  }

  const html = await response.text();
  const doc = new DOMParser().parseFromString(html, "text/html");
  const fragment = doc.querySelector("[data-browser-fragment='blog']");
  if (!fragment) {
    throw new Error("Missing blog browser fragment");
  }

  applyBrowserClippyDescriptor(fragment);
  browserContent.innerHTML = fragment.innerHTML;
  const nextUrl = fragment.getAttribute("data-browser-url") ?? "/blog/";
  const nextTitle = fragment.getAttribute("data-browser-title") ?? homeDocumentTitle;
  setBrowserChrome(`${homeBrowserOrigin}${nextUrl}`, nextTitle);
  initializePostExternalLinks(browserContent);
  syncContextualClippy();

  if (replace) {
    window.history.replaceState({ view: "blog" }, "", nextUrl);
  } else if (push) {
    window.history.pushState({ view: "blog" }, "", nextUrl);
  }

  document.querySelector(".ie-page")?.scrollTo({ top: 0, behavior: "auto" });
}

async function loadPostIntoBrowser(slug, { push = true, replace = false } = {}) {
  if (!browserContent || !browserAddress || !browserWindowTitle) return;
  window.openWindowById?.("browser");

  const response = await fetch(`/post-fragments/${slug}/`);
  if (!response.ok) {
    throw new Error(`Failed to load post fragment for ${slug}`);
  }

  const html = await response.text();
  const doc = new DOMParser().parseFromString(html, "text/html");
  const fragment = doc.querySelector("[data-browser-fragment='post']");
  if (!fragment) {
    throw new Error(`Missing browser fragment for ${slug}`);
  }

  applyBrowserClippyDescriptor(fragment);
  browserContent.innerHTML = fragment.innerHTML;
  const nextUrl = fragment.getAttribute("data-browser-url") ?? `/posts/${slug}/`;
  const nextTitle = fragment.getAttribute("data-browser-title") ?? homeDocumentTitle;
  setBrowserChrome(`${homeBrowserOrigin}${nextUrl}`, nextTitle);
  initializePostExternalLinks(browserContent);
  syncContextualClippy();

  if (replace) {
    window.history.replaceState({ view: "post", slug }, "", nextUrl);
  } else if (push) {
    window.history.pushState({ view: "post", slug }, "", nextUrl);
  }

  document.querySelector(".ie-page")?.scrollTo({ top: 0, behavior: "auto" });
}

function restoreHomeBrowser({ push = true, replace = false } = {}) {
  if (!browserContent || !browserAddress || !browserWindowTitle) return;
  applyBrowserClippyDescriptor(null);
  browserContent.innerHTML = homeBrowserContent;
  setBrowserChrome(homeBrowserAddress, homeDocumentTitle);
  syncContextualClippy();
  if (replace) {
    window.history.replaceState({ view: "home" }, "", "/");
  } else if (push) {
    window.history.pushState({ view: "home" }, "", "/");
  }
  initializePostExternalLinks(browserContent);
  initializeInfiniteScroll();
}

function renderBrowserNotFound(targetUrl) {
  if (!browserContent || !browserNotFoundTemplate) return;
  applyBrowserClippyDescriptor(null);
  const content = browserNotFoundTemplate.innerHTML.replace(
    "</article>",
    `<p><code>${escapeHtml(targetUrl)}</code></p></article>`
  );
  browserContent.innerHTML = content;
  setBrowserChrome(targetUrl, "404 Not Found | Eric Castro");
  initializePostExternalLinks(browserContent);
  syncContextualClippy();
}

function normalizeTypedBrowserUrl(rawValue) {
  const raw = rawValue.trim();
  if (!raw) return currentBrowserAddress;
  if (raw === homeBrowserOrigin || raw === `${homeBrowserOrigin}/`) {
    return `${homeBrowserOrigin}/`;
  }

  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(raw)) {
    return new URL(raw).toString();
  }

  if (raw.startsWith("/")) {
    return new URL(raw, `${homeBrowserOrigin}/`).toString();
  }

  if (raw.includes(".") && !raw.includes(" ")) {
    return new URL(`https://${raw}`).toString();
  }

  return new URL(raw.replace(/^\/?/, "/"), `${homeBrowserOrigin}/`).toString();
}

async function navigateBrowserAddress(rawValue) {
  let targetUrl;
  try {
    targetUrl = normalizeTypedBrowserUrl(rawValue);
  } catch {
    renderBrowserNotFound(`${homeBrowserOrigin}/`);
    return;
  }

  let parsed;
  try {
    parsed = new URL(targetUrl);
  } catch {
    renderBrowserNotFound(`${homeBrowserOrigin}/`);
    return;
  }

  if (parsed.origin !== homeBrowserOrigin) {
    showDialog(requestResultWidget);
    if (browserAddress) browserAddress.textContent = currentBrowserAddress;
    return;
  }

  const normalizedPath = parsed.pathname.endsWith("/") ? parsed.pathname : `${parsed.pathname}/`;
  if (normalizedPath === "/") {
    restoreHomeBrowser();
    return;
  }

  if (normalizedPath === "/blog/") {
    try {
      await loadBlogIntoBrowser();
    } catch {
      renderBrowserNotFound(parsed.toString());
    }
    return;
  }

  const projectMatch = normalizedPath.match(/^\/projects\/([^/]+)\/$/);
  if (projectMatch) {
    try {
      await loadProjectIntoBrowser(projectMatch[1]);
    } catch {
      renderBrowserNotFound(parsed.toString());
    }
    return;
  }

  const postMatch = normalizedPath.match(/^\/posts\/([^/]+)\/$/);
  if (postMatch) {
    try {
      await loadPostIntoBrowser(postMatch[1]);
    } catch {
      renderBrowserNotFound(parsed.toString());
    }
    return;
  }

  renderBrowserNotFound(parsed.toString());
}

function initializePostExternalLinks(root = document) {
  const origin = window.location.origin;
  root.querySelectorAll(".post90s .markdown-body a[href]").forEach((link) => {
    if (!(link instanceof HTMLAnchorElement)) return;
    if (!/^https?:\/\//i.test(link.href)) return;
    if (link.origin === origin) return;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  });
}

function initializeProjectNavigation() {
  if (!browserContent) return;

  let lastHandledProjectNav = "";
  let touchNavStartX = 0;
  let touchNavStartY = 0;
  let lastTouchNavigationAt = 0;

  function handleProjectNavigation(event) {
    if (event.type === "click" && Date.now() - lastTouchNavigationAt < 700) return;
    const target = event.target;
    if (!(target instanceof Element)) return false;

    const homeLink = target.closest("[data-browser-home]");
    if (homeLink instanceof HTMLAnchorElement) {
      event.preventDefault();
      restoreHomeBrowser();
      return true;
    }

    const blogLink = target.closest("a[href='/blog/']");
    if (blogLink instanceof HTMLAnchorElement) {
      event.preventDefault();
      loadBlogIntoBrowser().catch((error) => console.error(error));
      return true;
    }

    const anyLink = target.closest("a[href]");
    if (anyLink instanceof HTMLAnchorElement) {
      const href = anyLink.getAttribute("href") ?? "";
      if (/^https?:\/\//i.test(href) && anyLink.origin !== window.location.origin) {
        event.preventDefault();
        window.open(anyLink.href, "_blank", "noopener,noreferrer");
        return true;
      }
    }

    const projectLink = target.closest("a[href^='/projects/']");
    if (projectLink instanceof HTMLAnchorElement) {
      const slug = projectLink.getAttribute("href")?.split("/").filter(Boolean).pop();
      if (!slug) return false;

      const signature = `${event.type}:project:${slug}`;
      if (lastHandledProjectNav === signature) return true;
      lastHandledProjectNav = signature;
      window.setTimeout(() => {
        if (lastHandledProjectNav === signature) {
          lastHandledProjectNav = "";
        }
      }, 0);

      event.preventDefault();
      loadProjectIntoBrowser(slug).catch((error) => console.error(error));
      return true;
    }

    const postLink = target.closest("a[href^='/posts/']");
    if (!(postLink instanceof HTMLAnchorElement)) return false;

    const slug = postLink.getAttribute("href")?.split("/").filter(Boolean).pop();
    if (!slug) return false;

    const signature = `${event.type}:post:${slug}`;
    if (lastHandledProjectNav === signature) return true;
    lastHandledProjectNav = signature;
    window.setTimeout(() => {
      if (lastHandledProjectNav === signature) {
        lastHandledProjectNav = "";
      }
    }, 0);

    event.preventDefault();
    loadPostIntoBrowser(slug).catch((error) => console.error(error));
    return true;
  }

  document.addEventListener(
    "touchstart",
    (event) => {
      const touch = event.changedTouches?.[0];
      if (!touch) return;
      touchNavStartX = touch.clientX;
      touchNavStartY = touch.clientY;
    },
    { passive: true }
  );

  document.addEventListener("touchend", (event) => {
    const touch = event.changedTouches?.[0];
    if (!touch) return;
    const movedX = Math.abs(touch.clientX - touchNavStartX);
    const movedY = Math.abs(touch.clientY - touchNavStartY);
    if (movedX > 10 || movedY > 10) return;
    const handled = handleProjectNavigation(event);
    if (handled) {
      lastTouchNavigationAt = Date.now();
    }
  });

  document.addEventListener("click", handleProjectNavigation);

  window.addEventListener("popstate", () => {
    const path = window.location.pathname;
    if (path === "/") {
      restoreHomeBrowser({ push: false });
      return;
    }

    if (path === "/blog/" || path === "/blog") {
      loadBlogIntoBrowser({ push: false }).catch((error) => console.error(error));
      return;
    }

    const projectMatch = path.match(/^\/projects\/([^/]+)\/?$/);
    if (projectMatch) {
      loadProjectIntoBrowser(projectMatch[1], { push: false }).catch((error) => console.error(error));
      return;
    }

    const postMatch = path.match(/^\/posts\/([^/]+)\/?$/);
    if (postMatch) {
      loadPostIntoBrowser(postMatch[1], { push: false }).catch((error) => console.error(error));
    }
  });

  const initialQueryProject = new URLSearchParams(window.location.search).get("project");
  if (initialQueryProject) {
    loadProjectIntoBrowser(initialQueryProject, { push: false, replace: true }).catch((error) =>
      console.error(error)
    );
    return;
  }

  const initialQueryPost = new URLSearchParams(window.location.search).get("post");
  if (initialQueryPost) {
    loadPostIntoBrowser(initialQueryPost, { push: false, replace: true }).catch((error) =>
      console.error(error)
    );
    return;
  }

  if (new URLSearchParams(window.location.search).get("blog")) {
    loadBlogIntoBrowser({ push: false, replace: true }).catch((error) => console.error(error));
    return;
  }

  const directProjectMatch = window.location.pathname.match(/^\/projects\/([^/]+)\/?$/);
  if (directProjectMatch) {
    loadProjectIntoBrowser(directProjectMatch[1], { push: false, replace: true }).catch((error) =>
      console.error(error)
    );
    return;
  }

  const directPostMatch = window.location.pathname.match(/^\/posts\/([^/]+)\/?$/);
  if (directPostMatch) {
    loadPostIntoBrowser(directPostMatch[1], { push: false, replace: true }).catch((error) =>
      console.error(error)
    );
    return;
  }

  if (window.location.pathname === "/blog/" || window.location.pathname === "/blog") {
    loadBlogIntoBrowser({ push: false, replace: true }).catch((error) => console.error(error));
  }
}

function initializeBrowserAddressBar() {
  if (!browserAddress) return;

  browserAddress.addEventListener("focus", () => {
    placeCaretAtEnd(browserAddress);
  });

  browserAddress.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      navigateBrowserAddress(browserAddress.textContent || "").catch((error) => console.error(error));
      browserAddress.blur();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      browserAddress.textContent = currentBrowserAddress;
      browserAddress.blur();
    }
  });

  browserAddress.addEventListener("blur", () => {
    browserAddress.textContent = currentBrowserAddress;
  });
}

initializeTheme();
initializeCookieWidget();
initializeMyComputerWidget();
initializeGuestbookWidget();
initializeEmailWidget();
initializeShutdownWidget();
initializeCmdWidget();
initializeRetrucoWidget();
initializeClippy();
initializePostExternalLinks(document);
initializeInfiniteScroll();
initializeProjectNavigation();
initializeBrowserAddressBar();

window.addEventListener("resize", () => {
  dialogs.forEach((dialog) => {
    if (dialog.classList.contains("is-hidden")) return;
    centerDialog(dialog);
  });
});
