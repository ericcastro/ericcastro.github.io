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
const consentCookieName = "ericos95_cookie_consent";
const desktopRoot = document.querySelector(".desktop");
const dialogs = [cookieWidget, myComputerWidget, requestResultWidget].filter(Boolean);
let dialogZ = 60;

function centerDialog(dialog) {
  if (!dialog || !desktopRoot) return;
  const width = dialog.offsetWidth;
  const height = dialog.offsetHeight;
  const left = Math.max(0, Math.round((desktopRoot.clientWidth - width) / 2));
  const top = Math.max(0, Math.round((desktopRoot.clientHeight - height) / 2));
  dialog.style.left = `${left}px`;
  dialog.style.top = `${top}px`;
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
    darkToggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    darkToggle.textContent = theme === "dark" ? "Dark Mode: On" : "Dark Mode";
  }
}

function initializeTheme() {
  const savedTheme = localStorage.getItem(themeStorageKey) ?? "light";
  applyTheme(savedTheme);

  if (!darkToggle) return;
  darkToggle.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("theme-dark") ? "light" : "dark";
    localStorage.setItem(themeStorageKey, nextTheme);
    applyTheme(nextTheme);
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

  cookieAccept.addEventListener("click", acceptConsent);
  cookieDecline.addEventListener("click", declineConsent);
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

  computerRequest.addEventListener("click", () => {
    closeWidget();
    showDialog(requestResultWidget);
  });
  computerCancel.addEventListener("click", closeWidget);

  requestResultOk?.addEventListener("click", () => {
    hideDialog(requestResultWidget);
  });
}

function initializeInfiniteScroll() {
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

initializeTheme();
initializeCookieWidget();
initializeMyComputerWidget();
initializeInfiniteScroll();

window.addEventListener("resize", () => {
  dialogs.forEach((dialog) => {
    if (dialog.classList.contains("is-hidden")) return;
    centerDialog(dialog);
  });
});
