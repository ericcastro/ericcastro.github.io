import { requestFormApi, bindMessageForm } from "./message-form.js";

export function createGuestbook(widget) {
  const list = widget.querySelector("#guestbookEntries");
  const empty = widget.querySelector("#guestbookEmpty");
  const readStatus = widget.querySelector("#guestbookReadStatus");
  const refresh = widget.querySelector("#guestbookRefresh");
  const more = widget.querySelector("#guestbookMore");
  const endpoint = widget.dataset.apiUrl;
  let entries = [];
  let nextCursor = null;
  let loading = false;
  let pendingEntry = null;

  const validEntry = entry => entry && typeof entry.id === "string" &&
    typeof entry.name === "string" && typeof entry.message === "string" &&
    typeof entry.createdAt === "string";

  function render() {
    list.replaceChildren();
    for (const entry of entries) {
      const item = document.createElement("li");
      const header = document.createElement("div");
      header.className = "guestbook-entry-heading";
      const author = document.createElement("strong");
      author.textContent = entry.name;
      header.append(author);
      const date = new Date(entry.createdAt);
      if (Number.isFinite(date.getTime())) {
        const time = document.createElement("time");
        time.dateTime = date.toISOString();
        time.textContent = date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
        header.append(time);
      }
      const text = document.createElement("p");
      text.textContent = entry.message;
      item.append(header, text);
      list.append(item);
    }
    empty.hidden = entries.length > 0 || loading;
    more.hidden = !nextCursor;
  }

  async function load(append = false) {
    if (loading) return;
    loading = true;
    refresh.disabled = true;
    more.disabled = true;
    list.setAttribute("aria-busy", "true");
    empty.hidden = true;
    readStatus.textContent = "Loading signatures...";
    try {
      const url = new URL(endpoint, window.location.origin);
      if (append && nextCursor) url.searchParams.set("cursor", nextCursor);
      const data = await requestFormApi(url);
      if (!Array.isArray(data.entries) || !data.entries.every(validEntry) ||
          !(data.nextCursor === null || typeof data.nextCursor === "string")) {
        throw new Error("The guestbook is unavailable. Please try again.");
      }
      if (data.entries.some(entry => entry.id === pendingEntry?.id)) pendingEntry = null;
      const combined = append ? [...entries, ...data.entries] : data.entries;
      if (pendingEntry) combined.unshift(pendingEntry);
      entries = [...new Map(combined.map(entry => [entry.id, entry])).values()];
      nextCursor = data.nextCursor;
      readStatus.textContent = "";
    } catch (error) {
      readStatus.textContent = error instanceof TypeError || error.name === "TimeoutError"
        ? "Could not reach the guestbook. Please try Refresh."
        : error.message;
    } finally {
      loading = false;
      refresh.disabled = false;
      more.disabled = false;
      list.setAttribute("aria-busy", "false");
      render();
      // A failed request is not an empty guestbook.
      if (readStatus.textContent) empty.hidden = true;
    }
  }

  bindMessageForm(widget, {
    submitLabel: "Sign guestbook", sendingLabel: "Signing...",
    successMessage: "Thanks for signing my guestbook!",
    onSuccess(data) {
      if (!validEntry(data.entry)) throw new Error("Your signature could not be confirmed. Please try again later.");
      pendingEntry = data.entry;
      entries = [data.entry, ...entries.filter(entry => entry.id !== data.entry.id)];
      render();
    }
  });
  refresh.addEventListener("click", () => load());
  more.addEventListener("click", () => load(true));
  return { open: () => load() };
}
