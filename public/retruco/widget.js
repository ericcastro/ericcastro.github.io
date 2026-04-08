const DEFAULT_TITLE = "RETRUCO";
const DEFAULT_FRAME_WIDTH = 640;
const DEFAULT_FRAME_HEIGHT = 580;
const STYLE_ID = "retruco-widget-style";

const RETRUCO_MENU_DEFINITIONS = [
  {
    name: "game",
    label: "Juego",
    items: [
      { label: "Nuevo", action: "newMatch" },
      { label: "Elegir Pareja", action: "choosePartner" },
      { label: "Pantalla Inicial", action: "showSplash" },
      { label: "Mesa", action: "showTable" },
    ],
  },
  {
    name: "help",
    label: "Ayuda",
    items: [
      { label: "Inspector", action: "showInspector" },
      { label: "Acerca De", action: "showAbout" },
      { label: "Copiar Estado", action: "copyState" },
    ],
  },
];

function resolveTarget(target) {
  if (target instanceof Element) {
    return target;
  }

  if (typeof target === "string") {
    const node = document.querySelector(target);
    if (node) {
      return node;
    }
  }

  throw new Error("Retruco widget target not found.");
}

function ensureStyles(doc = document) {
  if (doc.getElementById(STYLE_ID)) {
    return;
  }

  const style = doc.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .retruco-widget-host {
      display: block;
      width: var(--retruco-frame-width, 640px);
      min-width: var(--retruco-frame-width, 640px);
    }

    .retruco-widget-window {
      width: var(--retruco-widget-width, 658px);
    }

    .retruco-widget-body {
      position: relative;
      padding: 0;
      overflow: visible;
    }

    .retruco-widget-menu-bar {
      display: flex;
      gap: 14px;
      padding: 4px 8px 3px;
      border-bottom: 1px solid #7f7f7f;
      background: #c0c0c0;
      position: relative;
      z-index: 3;
    }

    .retruco-widget-menu-toggle {
      border: 0;
      padding: 0 2px;
      background: transparent;
      box-shadow: none;
      min-width: 0;
      font: inherit;
    }

    .retruco-widget-menu-toggle:focus {
      outline: 1px dotted #000;
      outline-offset: 1px;
    }

    .retruco-widget-panels {
      position: absolute;
      left: 0;
      right: 0;
      top: 24px;
      z-index: 4;
      pointer-events: none;
    }

    .retruco-widget-menu-panel {
      position: absolute;
      top: 0;
      display: grid;
      min-width: 168px;
      padding: 2px;
      pointer-events: auto;
    }

    .retruco-widget-menu-panel[data-menu="game"] {
      left: 8px;
    }

    .retruco-widget-menu-panel[data-menu="help"] {
      left: 68px;
    }

    .retruco-widget-menu-panel.is-hidden {
      display: none;
    }

    .retruco-widget-menu-panel button {
      text-align: left;
      white-space: nowrap;
    }

    .retruco-widget-frame-wrap {
      display: block;
      padding: 0;
      background: transparent;
    }

    .retruco-widget-frame-wrap.is-windowed {
      padding: 8px;
      background: #c0c0c0;
    }

    .retruco-widget-frame {
      display: block;
      width: var(--retruco-frame-width, 640px);
      height: var(--retruco-frame-height, 580px);
      border: 0;
      background: transparent;
    }

    .retruco-widget-window .title-bar-controls button[disabled] {
      pointer-events: none;
      opacity: 0.7;
    }
  `;

  doc.head.append(style);
}

function buildFrameUrl(options) {
  const baseUrl = new URL(options.baseUrl ?? "./", import.meta.url);
  const url = new URL(options.framePath ?? "index.html", baseUrl);
  url.searchParams.set("widget", "1");
  if (options.seed) {
    url.searchParams.set("seed", options.seed);
  }
  return url.toString();
}

function createElement(doc, tagName, className, textContent = "") {
  const node = doc.createElement(tagName);
  if (className) {
    node.className = className;
  }
  if (textContent) {
    node.textContent = textContent;
  }
  return node;
}

function createMenuPanel(doc, menuName, items, invoke) {
  const panel = createElement(doc, "div", "window retruco-widget-menu-panel is-hidden");
  panel.dataset.menu = menuName;

  items.forEach((item) => {
    const button = createElement(doc, "button");
    button.type = "button";
    button.textContent = item.label;
    button.addEventListener("click", () => {
      invoke(item.action);
    });
    panel.append(button);
  });

  return panel;
}

function getFrameApi(frame) {
  try {
    return frame.contentWindow?.RETRUCO_API ?? null;
  } catch (error) {
    return null;
  }
}

function buildWidgetController(root, frame, doc, options = {}) {
  const cleanup = [];

  function getApi() {
    return getFrameApi(frame);
  }

  function call(method, ...args) {
    const api = getApi();
    if (!api || typeof api[method] !== "function") {
      return undefined;
    }

    return api[method](...args);
  }

  function invoke(action, ...args) {
    const api = getApi();
    if (!api) {
      return undefined;
    }

    const actionMap = {
      newMatch: () => api.newMatch?.(),
      choosePartner: () => api.choosePartner?.(),
      showSplash: () => api.showSplash?.(),
      showTable: () => api.showTable?.(),
      showInspector: () => api.showInspector?.(),
      showAbout: () => api.showAbout?.(),
      copyState: () => api.copyState?.(),
      setSeed: () => api.setSeed?.(args[0]),
    };

    return actionMap[action]?.();
  }

  function destroy() {
    while (cleanup.length > 0) {
      const fn = cleanup.pop();
      fn?.();
    }
    root.remove();
    options.onClose?.();
  }

  const handleLoad = () => {
    const api = getApi();
    if (!api?.ready) {
      options.onReady?.(widget);
      return;
    }

    api.ready().then(() => {
      options.onReady?.(widget);
    }).catch(() => {
      options.onReady?.(widget);
    });
  };

  frame.addEventListener("load", handleLoad);
  cleanup.push(() => {
    frame.removeEventListener("load", handleLoad);
  });

  const widget = {
    element: root,
    frame,
    destroy,
    getApi,
    call,
    invoke,
    setSeed(seed) {
      return invoke("setSeed", seed);
    },
    newMatch() {
      return invoke("newMatch");
    },
    choosePartner() {
      return invoke("choosePartner");
    },
    showTable() {
      return invoke("showTable");
    },
    showSplash() {
      return invoke("showSplash");
    },
    showInspector() {
      return invoke("showInspector");
    },
    showAbout() {
      return invoke("showAbout");
    },
    copyState() {
      return invoke("copyState");
    },
    menuDefinitions: RETRUCO_MENU_DEFINITIONS,
  };

  return {
    widget,
    addCleanup(fn) {
      cleanup.push(fn);
    },
  };
}

function buildFrame(doc, options = {}) {
  const frameWidth = options.frameWidth ?? DEFAULT_FRAME_WIDTH;
  const frameHeight = options.frameHeight ?? DEFAULT_FRAME_HEIGHT;
  const frameUrl = buildFrameUrl(options);

  const frameWrap = createElement(doc, "div", "retruco-widget-frame-wrap");
  const frame = createElement(doc, "iframe", "retruco-widget-frame");
  frame.title = options.frameTitle ?? options.title ?? DEFAULT_TITLE;
  frame.loading = "lazy";
  frame.src = frameUrl;

  frameWrap.append(frame);

  return {
    frameWrap,
    frame,
    frameWidth,
    frameHeight,
  };
}

function mountRetrucoWidget(target, options = {}) {
  const container = resolveTarget(target);
  const doc = container.ownerDocument;
  ensureStyles(doc);

  const { frameWrap, frame, frameWidth, frameHeight } = buildFrame(doc, options);
  const root = createElement(doc, "div", "retruco-widget-host");
  root.style.setProperty("--retruco-frame-width", `${frameWidth}px`);
  root.style.setProperty("--retruco-frame-height", `${frameHeight}px`);

  if (options.className) {
    root.classList.add(...String(options.className).split(/\s+/).filter(Boolean));
  }

  root.append(frameWrap);
  container.replaceChildren(root);

  return buildWidgetController(root, frame, doc, options).widget;
}

function mountRetrucoWindow(target, options = {}) {
  const container = resolveTarget(target);
  const doc = container.ownerDocument;
  ensureStyles(doc);

  const { frameWrap, frame, frameWidth, frameHeight } = buildFrame(doc, options);
  frameWrap.classList.add("is-windowed");

  const root = createElement(doc, "section", "window retruco-widget-window");
  root.style.setProperty("--retruco-frame-width", `${frameWidth}px`);
  root.style.setProperty("--retruco-frame-height", `${frameHeight}px`);
  root.style.setProperty("--retruco-widget-width", `${frameWidth + 18}px`);

  const titleBar = createElement(doc, "div", "title-bar");
  const titleText = createElement(doc, "div", "title-bar-text", options.title ?? DEFAULT_TITLE);
  const titleControls = createElement(doc, "div", "title-bar-controls");

  const minButton = createElement(doc, "button");
  minButton.type = "button";
  minButton.setAttribute("aria-label", "Minimize");
  minButton.disabled = true;

  const maxButton = createElement(doc, "button");
  maxButton.type = "button";
  maxButton.setAttribute("aria-label", "Maximize");
  maxButton.disabled = true;

  const closeButton = createElement(doc, "button");
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Close");

  titleControls.append(minButton, maxButton, closeButton);
  titleBar.append(titleText, titleControls);

  const body = createElement(doc, "div", "window-body retruco-widget-body");
  const menuBar = createElement(doc, "div", "retruco-widget-menu-bar");
  const panels = createElement(doc, "div", "retruco-widget-panels");

  body.append(menuBar, panels, frameWrap);
  root.append(titleBar, body);
  container.replaceChildren(root);

  const controller = buildWidgetController(root, frame, doc, options);
  const { widget, addCleanup } = controller;

  const menuPanels = new Map();

  function closeMenus() {
    menuPanels.forEach((panel) => {
      panel.classList.add("is-hidden");
    });
  }

  RETRUCO_MENU_DEFINITIONS.forEach((menu) => {
    const toggle = createElement(doc, "button", "retruco-widget-menu-toggle", menu.label);
    toggle.type = "button";
    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      const panel = menuPanels.get(menu.name);
      const nextHidden = panel.classList.contains("is-hidden");
      closeMenus();
      if (nextHidden) {
        panel.classList.remove("is-hidden");
      }
    });
    menuBar.append(toggle);

    const panel = createMenuPanel(doc, menu.name, menu.items, (action) => {
      closeMenus();
      widget.invoke(action);
    });
    menuPanels.set(menu.name, panel);
    panels.append(panel);
  });

  function handleDocumentClick(event) {
    if (!root.contains(event.target)) {
      closeMenus();
    }
  }

  doc.addEventListener("click", handleDocumentClick);
  addCleanup(() => {
    doc.removeEventListener("click", handleDocumentClick);
  });

  closeButton.addEventListener("click", () => {
    widget.destroy();
  });

  return widget;
}

const RetrucoWidget = {
  menuDefinitions: RETRUCO_MENU_DEFINITIONS,
  mount: mountRetrucoWidget,
  mountRetrucoWidget,
  mountRetrucoWindow,
};

if (typeof window !== "undefined") {
  window.RetrucoWidget = RetrucoWidget;
  window.mountRetrucoWidget = mountRetrucoWidget;
  window.mountRetrucoWindow = mountRetrucoWindow;
}

export { RETRUCO_MENU_DEFINITIONS, mountRetrucoWidget, mountRetrucoWindow };
export default RetrucoWidget;
