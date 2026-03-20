const windows = Array.from(document.querySelectorAll("[data-window]"));
const desktopEl = document.querySelector(".desktop");
const icons = Array.from(document.querySelectorAll(".desktop-icon"));
const taskbarTasks = document.getElementById("taskbarTasks");
const openTriggers = Array.from(document.querySelectorAll("[data-open-window]"));
const quickIE = document.getElementById("quickIE");
let topZ = 40;

function isCompactViewport() {
  return window.innerWidth <= 768;
}

function setInitialBrowserFrame() {
  const browser = document.getElementById("browser");
  if (!browser || !desktopEl) return;

  if (isCompactViewport()) {
    const horizontalMargin = 8;
    const bottomMargin = 8;
    const left = horizontalMargin;
    const top = 8;
    const width = Math.max(280, desktopEl.clientWidth - horizontalMargin * 2);
    const height = Math.max(
      parseInt(getComputedStyle(browser).minHeight, 10) || 140,
      desktopEl.clientHeight - top - bottomMargin
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

  const left = isCompactViewport() ? 8 : parseInt(notes.style.left || "28", 10);
  const bottomMargin = isCompactViewport() ? 8 : 12;
  const height = notes.offsetHeight || parseInt(notes.style.height || "280", 10);
  const top = Math.max(0, desktopEl.clientHeight - height - bottomMargin);

  notes.style.left = `${left}px`;
  notes.style.top = `${top}px`;
}

function isPrimaryPointer(event) {
  return event.isPrimary !== false && (event.pointerType === "touch" || event.button === 0);
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

function hideWindow(win) {
  win.classList.add("hidden");
}

function showWindow(win) {
  win.classList.remove("hidden");
}

function getVisibleWindows() {
  return windows.filter((win) => !state[win.id].closed && !state[win.id].minimized);
}

function getTopVisibleWindow() {
  return getVisibleWindows().sort(
    (a, b) => Number(b.style.zIndex || 0) - Number(a.style.zIndex || 0)
  )[0];
}

function activateWindow(win) {
  if (!win || state[win.id].closed) return;
  windows.forEach((candidate) => candidate.classList.remove("active"));
  win.classList.add("active");
  win.style.zIndex = String(++topZ);
  renderTaskbar();
}

function restoreWindow(win) {
  state[win.id].closed = false;
  state[win.id].minimized = false;
  showWindow(win);
  activateWindow(win);
}

function openWindowById(id) {
  const win = document.getElementById(id);
  if (!win) return;
  restoreWindow(win);
}

function minimizeWindow(win) {
  state[win.id].minimized = true;
  hideWindow(win);
  if (win.classList.contains("active")) {
    windows.forEach((candidate) => candidate.classList.remove("active"));
    const next = getTopVisibleWindow();
    if (next) activateWindow(next);
  }
  renderTaskbar();
}

function closeWindow(win) {
  state[win.id].closed = true;
  state[win.id].minimized = false;
  hideWindow(win);
  if (win.classList.contains("active")) {
    windows.forEach((candidate) => candidate.classList.remove("active"));
    const next = getTopVisibleWindow();
    if (next) activateWindow(next);
  }
  renderTaskbar();
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
}

function syncMaxButtons() {
  windows.forEach((win) => {
    const btn = win.querySelector('[data-action="maximize"]');
    if (!btn) return;
    btn.classList.toggle("max", !state[win.id].maximized);
    btn.classList.toggle("restore", state[win.id].maximized);
  });
}

function renderTaskbar() {
  if (!taskbarTasks) return;
  const ordered = [...windows].sort(
    (a, b) => Number(a.style.zIndex || 0) - Number(b.style.zIndex || 0)
  );
  taskbarTasks.innerHTML = "";
  ordered.forEach((win) => {
    if (state[win.id].closed) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "task-btn";
    if (win.classList.contains("active") && !state[win.id].minimized) {
      btn.classList.add("active");
    }
    btn.textContent = win.dataset.title ?? win.id;
    btn.addEventListener("click", () => {
      if (state[win.id].minimized) {
        restoreWindow(win);
      } else if (win.classList.contains("active")) {
        minimizeWindow(win);
      } else {
        state[win.id].minimized = false;
        showWindow(win);
        activateWindow(win);
      }
    });
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
      if (event.target.closest(".title-buttons")) return;
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
        const left = Math.min(
          Math.max(0, e.clientX - desktopRect.left - offsetX),
          maxLeft
        );
        const top = Math.min(
          Math.max(0, e.clientY - desktopRect.top - offsetY),
          maxTop
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

        win.style.left = `${Math.max(0, newLeft)}px`;
        win.style.top = `${Math.max(0, newTop)}px`;
        win.style.width = `${clamped.width}px`;
        win.style.height = `${clamped.height}px`;
      }

      function onUp(e) {
        if (e.pointerId !== event.pointerId) return;
        handleEl.releasePointerCapture?.(event.pointerId);
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
        document.removeEventListener("pointercancel", onUp);
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

    btn.addEventListener("click", (event) => {
      if (event.detail !== 0) return;
      handleWindowButton(event);
    });
    btn.addEventListener("pointerup", (event) => {
      if (!isPrimaryPointer(event)) return;
      handleWindowButton(event);
    });
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
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    openWindowById(trigger.dataset.openWindow);
  });
});

if (quickIE) {
  quickIE.addEventListener("click", () => openWindowById("browser"));
}

document.addEventListener("click", (event) => {
  if (!event.target.closest(".desktop-icon")) {
    icons.forEach((icon) => icon.classList.remove("selected"));
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
setInitialBrowserFrame();
setInitialNotesFrame();
renderTaskbar();
updateClock();
setInterval(updateClock, 30000);
