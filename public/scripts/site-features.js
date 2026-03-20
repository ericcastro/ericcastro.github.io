const themeStorageKey = "ericos95-theme";
const darkToggle = document.getElementById("darkModeToggle");
const postFeedStatus = document.getElementById("postFeedStatus");
const postFeedSentinel = document.getElementById("postFeedSentinel");
const postsFeed = document.getElementById("postsFeed");

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
initializeInfiniteScroll();
