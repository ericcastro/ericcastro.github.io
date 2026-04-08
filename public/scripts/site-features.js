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
const homeBrowserAddress = "https://eric.cast.ro";
const homeBrowserTitle = "https://eric.cast.ro - Microsoff Internet Ersplorer";
const homeDocumentTitle = document.title;
const homeBrowserContent = browserHomeTemplate?.innerHTML ?? browserContent?.innerHTML ?? "";
const homeBrowserOrigin = new URL(homeBrowserAddress).origin;
let currentBrowserAddress = homeBrowserAddress;

function isPrimaryPointer(event) {
  return event.isPrimary !== false && (event.pointerType === "touch" || event.button === 0);
}

function bindTapActivation(element, handler) {
  if (!element) return;
  element.addEventListener("click", (event) => {
    if (event.detail !== 0) return;
    handler(event);
  });
  element.addEventListener("pointerup", (event) => {
    if (!isPrimaryPointer(event)) return;
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
  dialog.style.zIndex = String(dialogZ++);
  dialog.classList.remove("is-hidden");
  dialog.classList.add("active");
  centerDialog(dialog);
}

function hideDialog(dialog) {
  if (!dialog) return;
  dialog.classList.add("is-hidden");
  dialog.classList.remove("active");
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

  [darkToggleRow, darkToggleLabel].filter(Boolean).forEach((element) => {
    element.addEventListener("pointerup", (event) => {
      if (!isPrimaryPointer(event)) return;
      toggleThemeFromTap(event);
    });
    element.addEventListener("click", (event) => {
      if (event.detail !== 0) return;
      toggleThemeFromTap(event);
    });
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

function syncRetrucoFrameSize() {
  if (!retrucoWidgetHost) return;
  const root = retrucoWidgetHost.querySelector(".retruco-widget-host");
  if (!(root instanceof HTMLElement)) return;
  const frame = root.querySelector(".retruco-widget-frame");
  const availableWidth = Math.max(320, retrucoWidgetHost.clientWidth);
  const availableHeight = Math.max(260, retrucoWidgetHost.clientHeight);

  root.style.setProperty("--retruco-frame-width", `${availableWidth}px`);
  root.style.setProperty("--retruco-frame-height", `${availableHeight}px`);

  if (frame instanceof HTMLIFrameElement) {
    frame.setAttribute("scrolling", "no");
    frame.style.transform = "";
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
        frameTitle: "RETRUCO.exe"
      });

      window.retrucoWidget = widget;

      widget.frame?.addEventListener(
        "load",
        () => {
          patchRetrucoFrame(widget);
          syncRetrucoFrameSize();
        },
        { once: true }
      );

      patchRetrucoFrame(widget);
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

  browserContent.innerHTML = fragment.innerHTML;
  const nextUrl = fragment.getAttribute("data-browser-url") ?? `/projects/${slug}/`;
  const nextTitle = fragment.getAttribute("data-browser-title") ?? homeDocumentTitle;
  setBrowserChrome(`${homeBrowserOrigin}${nextUrl}`, nextTitle);

  if (replace) {
    window.history.replaceState({ view: "project", slug }, "", nextUrl);
  } else if (push) {
    window.history.pushState({ view: "project", slug }, "", nextUrl);
  }

  document.querySelector(".ie-page")?.scrollTo({ top: 0, behavior: "auto" });
}

function restoreHomeBrowser({ push = true, replace = false } = {}) {
  if (!browserContent || !browserAddress || !browserWindowTitle) return;
  browserContent.innerHTML = homeBrowserContent;
  setBrowserChrome(homeBrowserAddress, homeDocumentTitle);
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
  const content = browserNotFoundTemplate.innerHTML.replace(
    "</article>",
    `<p><code>${escapeHtml(targetUrl)}</code></p></article>`
  );
  browserContent.innerHTML = content;
  setBrowserChrome(targetUrl, "404 Not Found | Eric Castro");
  initializePostExternalLinks(browserContent);
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

  const projectMatch = normalizedPath.match(/^\/projects\/([^/]+)\/$/);
  if (projectMatch) {
    try {
      await loadProjectIntoBrowser(projectMatch[1]);
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

  function handleProjectNavigation(event) {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const homeLink = target.closest("[data-browser-home]");
    if (homeLink instanceof HTMLAnchorElement) {
      event.preventDefault();
      restoreHomeBrowser();
      return;
    }

    const link = target.closest("a[href^='/projects/']");
    if (!(link instanceof HTMLAnchorElement)) return;

    const slug = link.getAttribute("href")?.split("/").filter(Boolean).pop();
    if (!slug) return;

    const signature = `${event.type}:${slug}`;
    if (lastHandledProjectNav === signature) return;
    lastHandledProjectNav = signature;
    window.setTimeout(() => {
      if (lastHandledProjectNav === signature) {
        lastHandledProjectNav = "";
      }
    }, 0);

    event.preventDefault();
    loadProjectIntoBrowser(slug).catch((error) => console.error(error));
  }

  document.addEventListener("click", handleProjectNavigation);
  document.addEventListener("pointerup", (event) => {
    if (!isPrimaryPointer(event)) return;
    handleProjectNavigation(event);
  });

  window.addEventListener("popstate", () => {
    const path = window.location.pathname;
    if (path === "/") {
      restoreHomeBrowser({ push: false });
      return;
    }

    const match = path.match(/^\/projects\/([^/]+)\/?$/);
    if (!match) return;
    loadProjectIntoBrowser(match[1], { push: false }).catch((error) => console.error(error));
  });

  const initialQueryProject = new URLSearchParams(window.location.search).get("project");
  if (initialQueryProject) {
    loadProjectIntoBrowser(initialQueryProject, { push: false, replace: true }).catch((error) =>
      console.error(error)
    );
    return;
  }

  const directProjectMatch = window.location.pathname.match(/^\/projects\/([^/]+)\/?$/);
  if (directProjectMatch) {
    loadProjectIntoBrowser(directProjectMatch[1], { push: false, replace: true }).catch((error) =>
      console.error(error)
    );
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
