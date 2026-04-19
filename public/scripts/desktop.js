const windows = Array.from(document.querySelectorAll("[data-window]"));
const desktopEl = document.querySelector(".desktop");
const icons = Array.from(document.querySelectorAll(".desktop-icon"));
const taskbarTasks = document.getElementById("taskbarTasks");
const openTriggers = Array.from(document.querySelectorAll("[data-open-window]"));
const startButton = document.getElementById("startButton");
const startMenu = document.getElementById("startMenu");
const startSubmenuToggles = Array.from(
  document.querySelectorAll("[data-start-submenu-toggle]")
);
const desktopStateStorageKey = "ericos95-desktop-state";
const externalWindows = new Map();
let activeExternalWindowId = null;
let cachedSavedDesktopState = null;
let topZ = 40;
let desktopStatePersistenceReady = false;

function readDesktopStateStorage() {
  try {
    const raw = window.localStorage.getItem(desktopStateStorageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeDesktopStateStorage(payload) {
  try {
    window.localStorage.setItem(desktopStateStorageKey, JSON.stringify(payload));
  } catch {}
}

function clearDesktopStateStorage() {
  try {
    window.localStorage.removeItem(desktopStateStorageKey);
  } catch {}
}

window.clearDesktopStateStorage = clearDesktopStateStorage;

function notifyActiveWindowChanged(win) {
  document.dispatchEvent(
    new CustomEvent("desktop:active-window-changed", {
      detail: {
        id: win?.id ?? null
      }
    })
  );
}

function deactivateExternalWindows() {
  activeExternalWindowId = null;
}

function getExternalVisibleWindows() {
  return Array.from(externalWindows.values()).filter(
    (entry) => !entry.state.closed && !entry.state.minimized
  );
}

function isCompactViewport() {
  return window.innerWidth <= 768;
}

function setInitialBrowserFrame() {
  const browser = document.getElementById("browser");
  if (!browser || !desktopEl) return;

  if (isCompactViewport()) {
    const horizontalMargin = 8;
    const bottomMargin = 8;
    const left = horizontalMargin + 3;
    const top = 28;
    const width = Math.max(280, desktopEl.clientWidth - horizontalMargin * 2 - 5);
    const height = Math.max(
      parseInt(getComputedStyle(browser).minHeight, 10) || 140,
      desktopEl.clientHeight - top - bottomMargin - 20
    );

    browser.style.left = `${left}px`;
    browser.style.top = `${top}px`;
    browser.style.width = `${width}px`;
    browser.style.height = `${height}px`;
    return;
  }

  const margin = 38;
  const top = parseInt(browser.style.top || "0", 10);
  const minHeight = parseInt(getComputedStyle(browser).minHeight, 10) || 140;
  const availableHeight = desktopEl.clientHeight - top - margin;
  browser.style.height = `${Math.max(minHeight, availableHeight)}px`;
}

function setInitialNotesFrame() {
  const notes = document.getElementById("notes");
  if (!notes || !desktopEl) return;

  if (isCompactViewport()) {
    const left = 2;
    const bottomMargin = 8;
    const height = notes.offsetHeight || parseInt(notes.style.height || "280", 10);
    const top = Math.max(0, desktopEl.clientHeight - height - bottomMargin);
    notes.style.left = `${left}px`;
    notes.style.top = `${top}px`;
    return;
  }

  const left = parseInt(notes.style.left || "28", 10);
  const bottomMargin = 12;
  const height = notes.offsetHeight || parseInt(notes.style.height || "280", 10);
  const top = Math.max(0, desktopEl.clientHeight - height - bottomMargin);

  notes.style.left = `${left}px`;
  notes.style.top = `${top}px`;
}

function setInitialProjectsFrame() {
  const projects = document.getElementById("projects");
  if (!projects || !desktopEl) return;

  if (isCompactViewport()) {
    const horizontalMargin = 8;
    const left = horizontalMargin;
    const top = 44;
    const width = Math.max(
      parseInt(getComputedStyle(projects).minWidth, 10) || 280,
      desktopEl.clientWidth - horizontalMargin * 2
    );
    const height = Math.max(
      parseInt(getComputedStyle(projects).minHeight, 10) || 140,
      desktopEl.clientHeight - top - 8
    );

    projects.style.left = `${left}px`;
    projects.style.top = `${top}px`;
    projects.style.width = `${width}px`;
    projects.style.height = `${height}px`;
    return;
  }

  const minWidth = parseInt(getComputedStyle(projects).minWidth, 10) || 430;
  const minHeight = parseInt(getComputedStyle(projects).minHeight, 10) || 340;
  projects.style.width = `${Math.max(minWidth, 540)}px`;
  projects.style.height = `${Math.max(minHeight, 474)}px`;
}

function setInitialRetrucoFrame() {
  const retruco = document.getElementById("retruco");
  if (!retruco || !desktopEl) return;

  if (isCompactViewport()) {
    const horizontalMargin = 0;
    const top = 18;
    const baseWidth =
      parseInt(retruco.style.width || "0", 10) ||
      parseInt(getComputedStyle(retruco).width, 10) ||
      656;
    const baseHeight =
      parseInt(retruco.style.height || "0", 10) ||
      parseInt(getComputedStyle(retruco).height, 10) ||
      627;
    const width = Math.max(
      parseInt(getComputedStyle(retruco).minWidth, 10) || 320,
      desktopEl.clientWidth - horizontalMargin * 2
    );
    const proportionalHeight = Math.round((width * baseHeight) / baseWidth) + 22;
    const height = Math.min(
      Math.max(parseInt(getComputedStyle(retruco).minHeight, 10) || 260, proportionalHeight),
      desktopEl.clientHeight - top - 8
    );

    retruco.style.left = `${horizontalMargin}px`;
    retruco.style.top = `${top}px`;
    retruco.style.width = `${width}px`;
    retruco.style.height = `${height}px`;
  }
}

function setInitialWinampFrame() {
  const winamp = document.getElementById("winamp");
  if (!winamp || !desktopEl) return;

  const width = Math.max(parseInt(getComputedStyle(winamp).minWidth, 10) || 275, 275);
  const height = Math.max(parseInt(getComputedStyle(winamp).minHeight, 10) || 348, 348);

  if (isCompactViewport()) {
    winamp.style.left = `${Math.max(0, desktopEl.clientWidth - width - 8)}px`;
    winamp.style.top = "36px";
    winamp.style.width = `${width}px`;
    winamp.style.height = `${height}px`;
    return;
  }

  winamp.style.left = "680px";
  winamp.style.top = "56px";
  winamp.style.width = `${width}px`;
  winamp.style.height = `${height}px`;
}

function setInitialCmdFrame() {
  const cmd = document.getElementById("cmd");
  if (!cmd || !desktopEl) return;

  if (isCompactViewport()) {
    const top = 5;
    const width = Math.min(360, Math.max(280, desktopEl.clientWidth - 40));
    const height = Math.min(280, Math.max(180, desktopEl.clientHeight - top - 12));
    const left = Math.max(0, desktopEl.clientWidth - width);
    cmd.style.left = `${left}px`;
    cmd.style.top = `${top}px`;
    cmd.style.width = `${width}px`;
    cmd.style.height = `${height}px`;
    return;
  }

  const left = 106;
  const top = 10;

  cmd.style.left = `${left}px`;
  cmd.style.top = `${top}px`;
}

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

const state = Object.fromEntries(
  windows.map((win) => [
    win.id,
    {
      minimized: win.classList.contains("hidden"),
      closed: win.classList.contains("hidden"),
      maximized: false,
      prev: {
        left: win.style.left,
        top: win.style.top,
        width: win.style.width,
        height: win.style.height
      }
    }
  ])
);

if (state.browser) {
  state.browser.closed = false;
  state.browser.minimized = false;
}

function clampWindow(win) {
  if (state[win.id].maximized || !desktopEl) return;
  const maxLeft = Math.max(0, desktopEl.clientWidth - win.offsetWidth);
  const maxTop = Math.max(0, desktopEl.clientHeight - win.offsetHeight);
  const left = Math.min(Math.max(0, parseInt(win.style.left || "0", 10)), maxLeft);
  const top = Math.min(Math.max(0, parseInt(win.style.top || "0", 10)), maxTop);
  win.style.left = `${left}px`;
  win.style.top = `${top}px`;
}

function clampSize(win, width, height) {
  const minWidth = parseInt(getComputedStyle(win).minWidth, 10) || 220;
  const minHeight = parseInt(getComputedStyle(win).minHeight, 10) || 140;
  return {
    width: Math.max(minWidth, Math.min(width, desktopEl?.clientWidth ?? width)),
    height: Math.max(minHeight, Math.min(height, desktopEl?.clientHeight ?? height))
  };
}

function getCurrentActiveWindowId() {
  if (activeExternalWindowId) {
    const externalEntry = externalWindows.get(activeExternalWindowId);
    if (externalEntry && !externalEntry.state.closed && !externalEntry.state.minimized) {
      return activeExternalWindowId;
    }
  }
  return windows.find((win) => win.classList.contains("active") && !state[win.id].closed && !state[win.id].minimized)
    ?.id ?? null;
}

function captureDesktopState() {
  return {
    windows: Object.fromEntries(
      windows.map((win) => [
        win.id,
        {
          left: win.style.left || "",
          top: win.style.top || "",
          width: win.style.width || "",
          height: win.style.height || "",
          minimized: state[win.id]?.minimized ?? win.classList.contains("hidden"),
          closed: state[win.id]?.closed ?? win.classList.contains("hidden"),
          maximized: state[win.id]?.maximized ?? false,
          prev: {
            left: state[win.id]?.prev?.left || "",
            top: state[win.id]?.prev?.top || "",
            width: state[win.id]?.prev?.width || "",
            height: state[win.id]?.prev?.height || ""
          }
        }
      ])
    ),
    externalWindows: Object.fromEntries(
      Array.from(externalWindows.entries()).map(([id, entry]) => [
        id,
        {
          minimized: entry.state.minimized,
          closed: entry.state.closed,
          left: entry.element?.style.left || entry.savedRect?.left || "",
          top: entry.element?.style.top || entry.savedRect?.top || "",
          width: entry.element?.style.width || entry.savedRect?.width || "",
          height: entry.element?.style.height || entry.savedRect?.height || ""
        }
      ])
    ),
    activeWindowId: getCurrentActiveWindowId()
  };
}

function saveDesktopState() {
  if (!desktopStatePersistenceReady) return;
  writeDesktopStateStorage(captureDesktopState());
}

function applySavedExternalWindowState(id, savedWindow) {
  const entry = externalWindows.get(id);
  if (!entry || !savedWindow) return;

  entry.savedRect = {
    left: typeof savedWindow.left === "string" ? savedWindow.left : "",
    top: typeof savedWindow.top === "string" ? savedWindow.top : "",
    width: typeof savedWindow.width === "string" ? savedWindow.width : "",
    height: typeof savedWindow.height === "string" ? savedWindow.height : ""
  };

  entry.state.closed = Boolean(savedWindow.closed);
  entry.state.minimized = !entry.state.closed && Boolean(savedWindow.minimized);

  if (entry.element) {
    if (entry.savedRect.left) entry.element.style.left = entry.savedRect.left;
    if (entry.savedRect.top) entry.element.style.top = entry.savedRect.top;
    if (entry.savedRect.width) entry.element.style.width = entry.savedRect.width;
    if (entry.savedRect.height) entry.element.style.height = entry.savedRect.height;

    if (entry.state.closed || entry.state.minimized) {
      hideWindow(entry.element);
    } else {
      showWindow(entry.element);
    }

    if (!entry.state.closed && !entry.state.minimized) {
      entry.element.style.zIndex = String(++topZ);
    }
  }
}

function applySavedDesktopState(savedState) {
  if (!savedState || typeof savedState !== "object" || !savedState.windows) return false;

  windows.forEach((win) => {
    const savedWindow = savedState.windows[win.id];
    if (!savedWindow) return;

    if (typeof savedWindow.left === "string") win.style.left = savedWindow.left;
    if (typeof savedWindow.top === "string") win.style.top = savedWindow.top;
    if (typeof savedWindow.width === "string") win.style.width = savedWindow.width;
    if (typeof savedWindow.height === "string") win.style.height = savedWindow.height;

    state[win.id].prev = {
      left: savedWindow.prev?.left || state[win.id].prev.left,
      top: savedWindow.prev?.top || state[win.id].prev.top,
      width: savedWindow.prev?.width || state[win.id].prev.width,
      height: savedWindow.prev?.height || state[win.id].prev.height
    };

    state[win.id].maximized = Boolean(savedWindow.maximized);
    win.classList.toggle("maximized", state[win.id].maximized);

    state[win.id].closed = Boolean(savedWindow.closed);
    state[win.id].minimized = !state[win.id].closed && Boolean(savedWindow.minimized);

    if (!state[win.id].maximized) {
      const currentWidth = parseInt(win.style.width || "0", 10);
      const currentHeight = parseInt(win.style.height || "0", 10);
      if (currentWidth > 0 && currentHeight > 0) {
        const clamped = clampSize(win, currentWidth, currentHeight);
        win.style.width = `${Math.round(clamped.width)}px`;
        win.style.height = `${Math.round(clamped.height)}px`;
      }
      clampWindow(win);
    }

    if (state[win.id].closed || state[win.id].minimized) {
      hideWindow(win);
    } else {
      showWindow(win);
      dispatchWindowLifecycle(win, "desktop:window-opened");
    }
  });

  windows.forEach((candidate) => candidate.classList.remove("active"));
  const activeWindow =
    (savedState.activeWindowId && document.getElementById(savedState.activeWindowId)) || null;

  topZ = 40;
  windows.forEach((win) => {
    if (!state[win.id].closed && !state[win.id].minimized) {
      win.style.zIndex = String(++topZ);
    }
  });

  if (
    activeWindow &&
    (
      (state[activeWindow.id] &&
        !state[activeWindow.id].closed &&
        !state[activeWindow.id].minimized) ||
      (externalWindows.has(activeWindow.id) &&
        !externalWindows.get(activeWindow.id).state.closed &&
        !externalWindows.get(activeWindow.id).state.minimized)
    )
  ) {
    activateWindowById(activeWindow.id);
  } else {
    const next = getTopVisibleWindow();
    if (next) activateWindowById(next.id);
    else {
      syncTitleBars();
      renderTaskbar();
      notifyActiveWindowChanged(null);
    }
  }

  syncMaxButtons();
  cachedSavedDesktopState = savedState;
  return true;
}

function hideWindow(win) {
  win.classList.add("hidden");
}

function showWindow(win) {
  win.classList.remove("hidden");
}

function dispatchWindowLifecycle(win, name) {
  win.dispatchEvent(
    new CustomEvent(name, {
      bubbles: false
    })
  );
}

function getVisibleWindows() {
  return windows.filter((win) => !state[win.id].closed && !state[win.id].minimized);
}

function getTopVisibleWindow() {
  const nativeTop = getVisibleWindows().sort(
    (a, b) => Number(b.style.zIndex || 0) - Number(a.style.zIndex || 0)
  )[0];
  const externalTop = getExternalVisibleWindows().sort(
    (a, b) => Number(b.element.style.zIndex || 0) - Number(a.element.style.zIndex || 0)
  )[0]?.element;

  if (!nativeTop) return externalTop;
  if (!externalTop) return nativeTop;
  return Number(nativeTop.style.zIndex || 0) >= Number(externalTop.style.zIndex || 0)
    ? nativeTop
    : externalTop;
}

function activateWindow(win) {
  if (!win || state[win.id].closed) return;
  deactivateExternalWindows();
  windows.forEach((candidate) => candidate.classList.remove("active"));
  win.classList.add("active");
  win.style.zIndex = String(++topZ);
  syncTitleBars();
  renderTaskbar();
  notifyActiveWindowChanged(win);
  saveDesktopState();
}

function restoreWindow(win) {
  const wasClosed = state[win.id].closed;
  const wasMinimized = state[win.id].minimized;
  state[win.id].closed = false;
  state[win.id].minimized = false;
  showWindow(win);
  activateWindow(win);
  if (wasClosed) {
    dispatchWindowLifecycle(win, "desktop:window-opened");
  } else if (wasMinimized) {
    dispatchWindowLifecycle(win, "desktop:window-restored");
  }
  saveDesktopState();
}

function activateExternalWindow(id) {
  const entry = externalWindows.get(id);
  if (!entry || entry.state.closed) return;
  windows.forEach((candidate) => candidate.classList.remove("active"));
  activeExternalWindowId = id;
  if (entry.element) {
    entry.element.style.zIndex = String(++topZ);
  }
  entry.onFocus?.();
  renderTaskbar();
  notifyActiveWindowChanged(entry.element ?? { id });
  saveDesktopState();
}

function restoreExternalWindow(id) {
  const entry = externalWindows.get(id);
  if (!entry) return;
  const wasClosed = entry.state.closed;
  const wasMinimized = entry.state.minimized;
  entry.state.closed = false;
  entry.state.minimized = false;
  if (entry.element) {
    showWindow(entry.element);
  }
  entry.onRestore?.();
  activateExternalWindow(id);
  if (wasClosed) {
    if (entry.element) dispatchWindowLifecycle(entry.element, "desktop:window-opened");
  } else if (wasMinimized) {
    if (entry.element) dispatchWindowLifecycle(entry.element, "desktop:window-restored");
  }
  saveDesktopState();
}

function openWindowById(id) {
  if (externalWindows.has(id)) {
    restoreExternalWindow(id);
    return;
  }
  const win = document.getElementById(id);
  if (!win) return;
  restoreWindow(win);
}

window.openWindowById = openWindowById;

function focusWindowById(id) {
  if (externalWindows.has(id)) {
    restoreExternalWindow(id);
    return;
  }
  const win = document.getElementById(id);
  if (!win) return;
  state[win.id].closed = false;
  state[win.id].minimized = false;
  showWindow(win);
  activateWindow(win);
}

window.focusWindowById = focusWindowById;

function activateWindowById(id) {
  if (externalWindows.has(id)) {
    activateExternalWindow(id);
    return;
  }
  const win = document.getElementById(id);
  if (!win) return;
  activateWindow(win);
}

function minimizeWindowById(id) {
  if (externalWindows.has(id)) {
    const entry = externalWindows.get(id);
    entry.state.minimized = true;
    entry.state.closed = false;
    if (entry.element) hideWindow(entry.element);
    entry.onMinimize?.();
    if (entry.element) dispatchWindowLifecycle(entry.element, "desktop:window-minimized");
    if (activeExternalWindowId === id) activeExternalWindowId = null;
    renderTaskbar();
    saveDesktopState();
    return;
  }
  const win = document.getElementById(id);
  if (!win) return;
  state[win.id].closed = false;
  minimizeWindow(win);
}

function closeWindowById(id) {
  if (externalWindows.has(id)) {
    const entry = externalWindows.get(id);
    entry.state.closed = true;
    entry.state.minimized = false;
    if (entry.element) hideWindow(entry.element);
    entry.onClose?.();
    if (entry.element) dispatchWindowLifecycle(entry.element, "desktop:window-closed");
    if (activeExternalWindowId === id) activeExternalWindowId = null;
    renderTaskbar();
    saveDesktopState();
    return;
  }
  const win = document.getElementById(id);
  if (!win) return;
  closeWindow(win);
}

function saveWindowStateById(id) {
  if (externalWindows.has(id)) {
    const entry = externalWindows.get(id);
    if (entry.element) clampWindow(entry.element);
    saveDesktopState();
    return;
  }
  const win = document.getElementById(id);
  if (!win) return;
  clampWindow(win);
  saveDesktopState();
}

window.EricOSDesktop = {
  openWindowById,
  focusWindowById,
  activateWindowById,
  minimizeWindowById,
  closeWindowById,
  saveWindowStateById,
  registerExternalWindow(config) {
    const entry = {
      id: config.id,
      title: config.title ?? config.id,
      iconClass: config.iconClass ?? "",
      element: null,
      onRestore: config.onRestore,
      onClose: config.onClose,
      onMinimize: config.onMinimize,
      onFocus: config.onFocus,
      savedRect: {
        left: config.initialRect?.left ?? "",
        top: config.initialRect?.top ?? "",
        width: config.initialRect?.width ?? "",
        height: config.initialRect?.height ?? ""
      },
      state: {
        closed: config.initialClosed ?? true,
        minimized: false
      }
    };

    externalWindows.set(config.id, entry);
    const savedWindow = cachedSavedDesktopState?.externalWindows?.[config.id];
    if (savedWindow) {
      applySavedExternalWindowState(config.id, savedWindow);
    }

    renderTaskbar();
    return entry;
  },
  setExternalWindowElement(id, element) {
    const entry = externalWindows.get(id);
    if (!entry || !(element instanceof HTMLElement)) return null;
    entry.element = element;

    if (entry.savedRect.left) element.style.left = entry.savedRect.left;
    if (entry.savedRect.top) element.style.top = entry.savedRect.top;
    if (entry.savedRect.width) element.style.width = entry.savedRect.width;
    if (entry.savedRect.height) element.style.height = entry.savedRect.height;

    if (entry.state.closed || entry.state.minimized) {
      hideWindow(element);
    } else {
      showWindow(element);
      element.style.zIndex = String(++topZ);
    }

    const activateExternal = (event) => {
      if (!entry.state.closed && !entry.state.minimized) {
        activateExternalWindow(id);
      }
    };

    element.addEventListener("pointerdown", (event) => {
      if (!isPrimaryPointer(event)) return;
      activateExternal(event);
    }, true);
    element.addEventListener("mousedown", activateExternal, true);
    element.addEventListener("touchstart", activateExternal, { capture: true, passive: true });

    renderTaskbar();
    saveDesktopState();
    return entry;
  }
};

function setStartMenuOpen(isOpen) {
  if (!startButton || !startMenu) return;
  startButton.classList.toggle("menu-open", isOpen);
  startButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
  startMenu.classList.toggle("hidden", !isOpen);
  if (!isOpen) {
    startMenu
      .querySelectorAll(".start-menu-item-wrap.open")
      .forEach((item) => item.classList.remove("open"));
    startMenu
      .querySelectorAll(".start-menu-item-wrap.open-up")
      .forEach((item) => item.classList.remove("open-up"));
    startMenu
      .querySelectorAll("[data-start-submenu-toggle][aria-expanded='true']")
      .forEach((toggle) => toggle.setAttribute("aria-expanded", "false"));
  }
  renderTaskbar();
}

window.setStartMenuOpen = setStartMenuOpen;

function minimizeWindow(win) {
  state[win.id].minimized = true;
  hideWindow(win);
  dispatchWindowLifecycle(win, "desktop:window-minimized");
  if (win.classList.contains("active")) {
    windows.forEach((candidate) => candidate.classList.remove("active"));
    const next = getTopVisibleWindow();
    if (next) activateWindowById(next.id);
    else notifyActiveWindowChanged(null);
  }
  renderTaskbar();
  saveDesktopState();
}

function closeWindow(win) {
  state[win.id].closed = true;
  state[win.id].minimized = false;
  hideWindow(win);
  dispatchWindowLifecycle(win, "desktop:window-closed");
  if (win.classList.contains("active")) {
    windows.forEach((candidate) => candidate.classList.remove("active"));
    const next = getTopVisibleWindow();
    if (next) activateWindowById(next.id);
    else notifyActiveWindowChanged(null);
  }
  renderTaskbar();
  saveDesktopState();
}

function maximizeWindow(win) {
  const winState = state[win.id];
  if (!winState.maximized) {
    winState.prev = {
      left: win.style.left,
      top: win.style.top,
      width: win.style.width,
      height: win.style.height
    };
    winState.maximized = true;
    win.classList.add("maximized");
  } else {
    winState.maximized = false;
    win.classList.remove("maximized");
    win.style.left = winState.prev.left;
    win.style.top = winState.prev.top;
    win.style.width = winState.prev.width;
    win.style.height = winState.prev.height;
    clampWindow(win);
  }
  syncMaxButtons();
  activateWindow(win);
  saveDesktopState();
}

function syncMaxButtons() {
  windows.forEach((win) => {
    const btn = win.querySelector('[data-action="maximize"]');
    if (!btn) return;
    btn.classList.toggle("maximize", !state[win.id].maximized);
    btn.classList.toggle("restore", state[win.id].maximized);
    btn.setAttribute("aria-label", state[win.id].maximized ? "Restore" : "Maximize");
  });
}

function syncTitleBars() {
  windows.forEach((win) => {
    const titleBar = win.querySelector(".title-bar");
    if (!titleBar) return;
    titleBar.classList.toggle("inactive", !win.classList.contains("active"));
  });
}

function renderTaskbar() {
  if (!taskbarTasks) return;
  taskbarTasks.innerHTML = "";
  const startMenuIsOpen = startMenu && !startMenu.classList.contains("hidden");
  windows.forEach((win) => {
    if (state[win.id].closed) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "task-btn";
    btn.setAttribute(
      "aria-pressed",
      win.classList.contains("active") && !state[win.id].minimized && !startMenuIsOpen
        ? "true"
        : "false"
    );
    if (win.classList.contains("active") && !state[win.id].minimized && !startMenuIsOpen) {
      btn.classList.add("active");
    }
    const icon = win.querySelector(".title-icon")?.cloneNode(true);
    if (icon instanceof HTMLElement) {
      icon.classList.add("task-icon");
      icon.setAttribute("aria-hidden", "true");
      btn.appendChild(icon);
    }

    const label = document.createElement("span");
    label.className = "task-label";
    label.textContent = win.dataset.title ?? win.id;
    btn.appendChild(label);

    function handleTaskbarButtonActivation() {
      if (state[win.id].minimized) {
        restoreWindow(win);
      } else if (win.classList.contains("active")) {
        minimizeWindow(win);
      } else {
        state[win.id].minimized = false;
        showWindow(win);
        activateWindow(win);
      }
    }

    if (isCompactViewport()) {
      bindTapActivation(btn, handleTaskbarButtonActivation);
    } else {
      let desktopActivatedAt = 0;

      btn.addEventListener("pointerup", (event) => {
        if (event.pointerType === "touch" || event.button !== 0) return;
        desktopActivatedAt = Date.now();
        handleTaskbarButtonActivation();
      });

      btn.addEventListener("click", () => {
        if (Date.now() - desktopActivatedAt < 250) return;
        handleTaskbarButtonActivation();
      });
    }
    taskbarTasks.appendChild(btn);
  });

  externalWindows.forEach((entry, id) => {
    if (entry.state.closed) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "task-btn";
    const isActive =
      activeExternalWindowId === id && !entry.state.minimized && !startMenuIsOpen;
    btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    if (isActive) {
      btn.classList.add("active");
    }

    const icon = document.createElement("span");
    icon.className = `title-icon ${entry.iconClass} task-icon`;
    icon.setAttribute("aria-hidden", "true");
    btn.appendChild(icon);

    const label = document.createElement("span");
    label.className = "task-label";
    label.textContent = entry.title;
    btn.appendChild(label);

    function handleTaskbarButtonActivation() {
      if (entry.state.minimized) {
        restoreExternalWindow(id);
      } else if (activeExternalWindowId === id) {
        minimizeWindowById(id);
      } else {
        restoreExternalWindow(id);
      }
    }

    if (isCompactViewport()) {
      bindTapActivation(btn, handleTaskbarButtonActivation);
    } else {
      let desktopActivatedAt = 0;

      btn.addEventListener("pointerup", (event) => {
        if (event.pointerType === "touch" || event.button !== 0) return;
        desktopActivatedAt = Date.now();
        handleTaskbarButtonActivation();
      });

      btn.addEventListener("click", () => {
        if (Date.now() - desktopActivatedAt < 250) return;
        handleTaskbarButtonActivation();
      });
    }
    taskbarTasks.appendChild(btn);
  });
}

windows.forEach((win) => {
  const dragHandle = win.querySelector("[data-drag-handle]");

  win.addEventListener("pointerdown", (event) => {
    if (!isPrimaryPointer(event)) return;
    if (!state[win.id].closed && !state[win.id].minimized) {
      activateWindow(win);
    }
  });

  if (dragHandle) {
    dragHandle.addEventListener("dblclick", () => maximizeWindow(win));
    dragHandle.addEventListener("pointerdown", (event) => {
      if (!isPrimaryPointer(event)) return;
      if (event.target.closest(".title-bar-controls")) return;
      if (state[win.id].maximized || !desktopEl) return;
      event.preventDefault();
      activateWindow(win);
      dragHandle.setPointerCapture?.(event.pointerId);

      const rect = win.getBoundingClientRect();
      const desktopRect = desktopEl.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;

      function onMove(e) {
        if (e.pointerId !== event.pointerId) return;
        const maxLeft = Math.max(0, desktopEl.clientWidth - win.offsetWidth);
        const maxTop = Math.max(0, desktopEl.clientHeight - win.offsetHeight);
        const left = Math.round(
          Math.min(
            Math.max(0, e.clientX - desktopRect.left - offsetX),
            maxLeft
          )
        );
        const top = Math.round(
          Math.min(
            Math.max(0, e.clientY - desktopRect.top - offsetY),
            maxTop
          )
        );
        win.style.left = `${left}px`;
        win.style.top = `${top}px`;
      }

      function onUp(e) {
        if (e.pointerId !== event.pointerId) return;
        dragHandle.releasePointerCapture?.(event.pointerId);
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
        document.removeEventListener("pointercancel", onUp);
        saveDesktopState();
      }

      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
      document.addEventListener("pointercancel", onUp);
    });
  }

  win.querySelectorAll("[data-resize]").forEach((handleEl) => {
    handleEl.addEventListener("pointerdown", (event) => {
      if (!isPrimaryPointer(event)) return;
      event.stopPropagation();
      if (state[win.id].maximized || !desktopEl) return;
      event.preventDefault();
      activateWindow(win);
      handleEl.setPointerCapture?.(event.pointerId);

      const dir = handleEl.dataset.resize ?? "";
      const startX = event.clientX;
      const startY = event.clientY;
      const startLeft = parseInt(win.style.left || "0", 10);
      const startTop = parseInt(win.style.top || "0", 10);
      const startWidth = win.offsetWidth;
      const startHeight = win.offsetHeight;

      function onMove(e) {
        if (e.pointerId !== event.pointerId) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        let newLeft = startLeft;
        let newTop = startTop;
        let newWidth = startWidth;
        let newHeight = startHeight;

        if (dir.includes("e")) newWidth = startWidth + dx;
        if (dir.includes("s")) newHeight = startHeight + dy;
        if (dir.includes("w")) {
          newWidth = startWidth - dx;
          newLeft = startLeft + dx;
        }
        if (dir.includes("n")) {
          newHeight = startHeight - dy;
          newTop = startTop + dy;
        }

        const minWidth = parseInt(getComputedStyle(win).minWidth, 10) || 220;
        const minHeight = parseInt(getComputedStyle(win).minHeight, 10) || 140;

        if (newWidth < minWidth) {
          if (dir.includes("w")) newLeft -= minWidth - newWidth;
          newWidth = minWidth;
        }
        if (newHeight < minHeight) {
          if (dir.includes("n")) newTop -= minHeight - newHeight;
          newHeight = minHeight;
        }

        if (newLeft < 0) {
          if (dir.includes("w")) newWidth += newLeft;
          newLeft = 0;
        }
        if (newTop < 0) {
          if (dir.includes("n")) newHeight += newTop;
          newTop = 0;
        }

        if (newLeft + newWidth > desktopEl.clientWidth) {
          if (dir.includes("e")) newWidth = desktopEl.clientWidth - newLeft;
          else newLeft = Math.max(0, desktopEl.clientWidth - newWidth);
        }
        if (newTop + newHeight > desktopEl.clientHeight) {
          if (dir.includes("s")) newHeight = desktopEl.clientHeight - newTop;
          else newTop = Math.max(0, desktopEl.clientHeight - newHeight);
        }

        const clamped = clampSize(win, newWidth, newHeight);
        if (dir.includes("w")) newLeft = startLeft + startWidth - clamped.width;
        if (dir.includes("n")) newTop = startTop + startHeight - clamped.height;

        win.style.left = `${Math.round(Math.max(0, newLeft))}px`;
        win.style.top = `${Math.round(Math.max(0, newTop))}px`;
        win.style.width = `${Math.round(clamped.width)}px`;
        win.style.height = `${Math.round(clamped.height)}px`;
      }

      function onUp(e) {
        if (e.pointerId !== event.pointerId) return;
        handleEl.releasePointerCapture?.(event.pointerId);
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
        document.removeEventListener("pointercancel", onUp);
        saveDesktopState();
      }

      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
      document.addEventListener("pointercancel", onUp);
    });
  });

  win.querySelectorAll(".win-btn").forEach((btn) => {
    function handleWindowButton(event) {
      event.stopPropagation();
      event.preventDefault();
      const action = btn.dataset.action;
      if (action === "minimize") minimizeWindow(win);
      if (action === "maximize") maximizeWindow(win);
      if (action === "close") closeWindow(win);
    }

    bindTapActivation(btn, handleWindowButton);
  });
});

icons.forEach((icon) => {
  icon.addEventListener("click", () => {
    icons.forEach((candidate) => candidate.classList.remove("selected"));
    icon.classList.add("selected");
  });

  icon.addEventListener("dblclick", () => openWindowById(icon.dataset.icon));
  icon.addEventListener("keydown", (event) => {
    if (event.key === "Enter") openWindowById(icon.dataset.icon);
  });
});

openTriggers.forEach((trigger) => {
  bindTapActivation(trigger, (event) => {
    event.preventDefault();
    openWindowById(trigger.dataset.openWindow);
  });
});

let delegatedTouchOpenStartX = 0;
let delegatedTouchOpenStartY = 0;

document.addEventListener(
  "touchstart",
  (event) => {
    const touch = event.changedTouches?.[0];
    if (!touch) return;
    delegatedTouchOpenStartX = touch.clientX;
    delegatedTouchOpenStartY = touch.clientY;
  },
  { passive: true }
);

document.addEventListener("touchend", (event) => {
  const touch = event.changedTouches?.[0];
  if (!touch) return;
  const movedX = Math.abs(touch.clientX - delegatedTouchOpenStartX);
  const movedY = Math.abs(touch.clientY - delegatedTouchOpenStartY);
  if (movedX > 10 || movedY > 10) return;
  const trigger = event.target.closest?.("[data-open-window]");
  if (!(trigger instanceof HTMLElement)) return;
  event.preventDefault();
  openWindowById(trigger.dataset.openWindow);
});

document.addEventListener("click", (event) => {
  if (event.defaultPrevented) return;
  const trigger = event.target.closest("[data-open-window]");
  if (!(trigger instanceof HTMLElement)) return;
  event.preventDefault();
  openWindowById(trigger.dataset.openWindow);
});

document.addEventListener("pointerdown", (event) => {
  if (!event.target.closest(".desktop-icon")) {
    icons.forEach((icon) => icon.classList.remove("selected"));
  }

  if (
    startButton &&
    startMenu &&
    !event.target.closest("#startButton") &&
    !event.target.closest("#startMenu")
  ) {
    setStartMenuOpen(false);
  }
});

bindTapActivation(startButton, (event) => {
  event.stopPropagation();
  setStartMenuOpen(startMenu?.classList.contains("hidden") ?? true);
});

startMenu?.querySelectorAll("[data-start-open]").forEach((item) => {
  bindTapActivation(item, (event) => {
    const id = event.currentTarget.dataset.startOpen;
    if (!id) return;
    setStartMenuOpen(false);
    openWindowById(id);
  });
});

startMenu?.querySelectorAll(".start-menu-item").forEach((item) => {
  bindTapActivation(item, () => {
    if (item.hasAttribute("data-start-submenu-toggle")) return;
    setStartMenuOpen(false);
  });
});

startSubmenuToggles.forEach((toggle) => {
  const submenuName = toggle.getAttribute("data-start-submenu-toggle");
  const wrapper = toggle.closest(".start-menu-item-wrap");
  const submenu = wrapper?.querySelector(".start-submenu");
  if (!submenuName || !wrapper || !startMenu) return;

  function openCurrentSubmenu() {
    startMenu.querySelectorAll(".start-menu-item-wrap.open").forEach((item) => {
      if (item !== wrapper) item.classList.remove("open");
    });
    startMenu.querySelectorAll(".start-menu-item-wrap.open-up").forEach((item) => {
      if (item !== wrapper) item.classList.remove("open-up");
    });
    startMenu.querySelectorAll(".start-menu-item-wrap.open-left").forEach((item) => {
      if (item !== wrapper) item.classList.remove("open-left");
    });
    startMenu
      .querySelectorAll("[data-start-submenu-toggle]")
      .forEach((button) => button.setAttribute("aria-expanded", button === toggle ? "true" : "false"));
    wrapper.classList.add("open");
    if (submenu && desktopEl) {
      wrapper.classList.remove("open-up");
      wrapper.classList.remove("open-left");
      let submenuRect = submenu.getBoundingClientRect();
      const desktopRect = desktopEl.getBoundingClientRect();
      if (submenuRect.right > desktopRect.right) {
        wrapper.classList.add("open-left");
        submenuRect = submenu.getBoundingClientRect();
      }
      const overflowBottom = submenuRect.bottom - desktopRect.bottom;
      if (overflowBottom > 0) {
        wrapper.classList.add("open-up");
      }
    }
  }

  bindTapActivation(toggle, (event) => {
    event.stopPropagation();
    const willOpen = !wrapper.classList.contains("open");
    if (!willOpen) {
      wrapper.classList.remove("open");
      wrapper.classList.remove("open-up");
      wrapper.classList.remove("open-left");
      toggle.setAttribute("aria-expanded", "false");
      return;
    }
    openCurrentSubmenu();
  });

  wrapper.addEventListener("mouseenter", () => {
    if (startMenu.classList.contains("hidden")) return;
    openCurrentSubmenu();
  });

  toggle.addEventListener("focus", () => {
    if (startMenu.classList.contains("hidden")) return;
    openCurrentSubmenu();
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setStartMenuOpen(false);
  }
});

function updateClock() {
  const el = document.getElementById("clock");
  if (!el) return;
  const now = new Date();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const suffix = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  el.textContent = `${hours}:${minutes} ${suffix}`;
}

window.addEventListener("resize", () => windows.forEach(clampWindow));

syncMaxButtons();
syncTitleBars();
setInitialBrowserFrame();
setInitialNotesFrame();
setInitialProjectsFrame();
setInitialRetrucoFrame();
setInitialWinampFrame();
setInitialCmdFrame();
const browserWindow = document.getElementById("browser");
const notesWindow = document.getElementById("notes");
const cmdWindow = document.getElementById("cmd");

if (browserWindow) {
  browserWindow.style.zIndex = "42";
}

if (isCompactViewport() && browserWindow) {
  if (notesWindow) notesWindow.style.zIndex = "35";
  if (cmdWindow) cmdWindow.style.zIndex = "36";
  browserWindow.style.zIndex = "42";
  topZ = 42;
  activateWindow(browserWindow);
} else {
  if (notesWindow) notesWindow.style.zIndex = "35";
  if (cmdWindow) cmdWindow.style.zIndex = "38";
  topZ = 42;
  activateWindow(browserWindow ?? notesWindow ?? cmdWindow);
}

const savedDesktopState = readDesktopStateStorage();
cachedSavedDesktopState = savedDesktopState;
if (savedDesktopState) {
  applySavedDesktopState(savedDesktopState);
}
desktopStatePersistenceReady = true;
if (savedDesktopState) {
  saveDesktopState();
}

updateClock();
setInterval(updateClock, 30000);
