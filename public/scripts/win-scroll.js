function initializeWinScroll(element) {
  if (element.dataset.winScrollEnhanced === "true") return;
  element.dataset.winScrollEnhanced = "true";
  const shell = element.parentElement?.classList.contains("win-scroll-shell")
    ? element.parentElement
    : element;

  const track = document.createElement("div");
  track.className = "win-scroll-track";

  const upButton = document.createElement("button");
  upButton.type = "button";
  upButton.className = "win-scroll-button up";
  upButton.setAttribute("aria-label", "Scroll up");

  const slot = document.createElement("div");
  slot.className = "win-scroll-slot";

  const slotFill = document.createElement("div");
  slotFill.className = "win-scroll-slot-fill";

  const thumb = document.createElement("div");
  thumb.className = "win-scroll-thumb";

  const downButton = document.createElement("button");
  downButton.type = "button";
  downButton.className = "win-scroll-button down";
  downButton.setAttribute("aria-label", "Scroll down");

  slot.appendChild(slotFill);
  slot.appendChild(thumb);
  track.appendChild(upButton);
  track.appendChild(slot);
  track.appendChild(downButton);
  shell.appendChild(track);

  function updateScrollbar() {
    const { scrollTop, scrollHeight, clientHeight } = element;
    const maxScroll = Math.max(0, scrollHeight - clientHeight);

    if (maxScroll <= 0) {
      track.classList.add("is-hidden");
      return;
    }

    track.classList.remove("is-hidden");
    const slotHeight = slot.clientHeight;
    const thumbHeight = Math.max(22, Math.round((clientHeight / scrollHeight) * slotHeight));
    const maxThumbTop = Math.max(0, slotHeight - thumbHeight);
    const thumbTop = maxScroll === 0 ? 0 : Math.round((scrollTop / maxScroll) * maxThumbTop);

    thumb.style.height = `${thumbHeight}px`;
    thumb.style.top = `${thumbTop}px`;
  }

  function scrollByAmount(amount) {
    element.scrollTop += amount;
  }

  function bindPressState(button, amount) {
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      button.classList.add("is-pressed");
      button.setPointerCapture?.(event.pointerId);
    });

    function clearPress(event) {
      if (event && button.hasPointerCapture?.(event.pointerId)) {
        button.releasePointerCapture?.(event.pointerId);
      }
      button.classList.remove("is-pressed");
    }

    button.addEventListener("pointerup", (event) => {
      scrollByAmount(amount);
      clearPress(event);
    });
    button.addEventListener("pointercancel", clearPress);
    button.addEventListener("lostpointercapture", clearPress);
  }

  bindPressState(upButton, -40);
  bindPressState(downButton, 40);

  slot.addEventListener("pointerdown", (event) => {
    if (event.target === thumb) return;
    event.preventDefault();
    slot.classList.add("is-pressed");
    slot.setPointerCapture?.(event.pointerId);
    const thumbRect = thumb.getBoundingClientRect();
    const clickAboveThumb = event.clientY < thumbRect.top;
    const thumbTop = thumb.offsetTop;
    const thumbBottom = thumbTop + thumb.offsetHeight;
    const fillTop = clickAboveThumb ? 0 : thumbBottom;
    const fillHeight = clickAboveThumb ? thumbTop : Math.max(0, slot.clientHeight - thumbBottom);
    slotFill.style.top = `${fillTop}px`;
    slotFill.style.height = `${fillHeight}px`;
    scrollByAmount((clickAboveThumb ? -1 : 1) * element.clientHeight * 0.9);

    function clearSlotPress(clearEvent) {
      if (clearEvent && slot.hasPointerCapture?.(clearEvent.pointerId)) {
        slot.releasePointerCapture?.(clearEvent.pointerId);
      }
      slot.classList.remove("is-pressed");
      slotFill.style.height = "0px";
      slot.removeEventListener("pointerup", clearSlotPress);
      slot.removeEventListener("pointercancel", clearSlotPress);
      slot.removeEventListener("lostpointercapture", clearSlotPress);
    }

    slot.addEventListener("pointerup", clearSlotPress);
    slot.addEventListener("pointercancel", clearSlotPress);
    slot.addEventListener("lostpointercapture", clearSlotPress);
  });

  thumb.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    thumb.setPointerCapture?.(event.pointerId);

    const startY = event.clientY;
    const startScrollTop = element.scrollTop;

    function onMove(moveEvent) {
      if (moveEvent.pointerId !== event.pointerId) return;
      const deltaY = moveEvent.clientY - startY;
      const maxScroll = Math.max(0, element.scrollHeight - element.clientHeight);
      const maxThumbTravel = Math.max(1, slot.clientHeight - thumb.offsetHeight);
      element.scrollTop = startScrollTop + (deltaY / maxThumbTravel) * maxScroll;
    }

    function onUp(upEvent) {
      if (upEvent.pointerId !== event.pointerId) return;
      thumb.releasePointerCapture?.(event.pointerId);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
    }

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onUp);
  });

  element.addEventListener("scroll", updateScrollbar, { passive: true });
  window.addEventListener("resize", updateScrollbar);
  updateScrollbar();
}

document.querySelectorAll(".win-scroll").forEach(initializeWinScroll);
