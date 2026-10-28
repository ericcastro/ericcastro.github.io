import { readFile, writeFile } from "node:fs/promises";
import { build } from "esbuild";

// Webamp 2.3.1 has no custom GenWindow content API. Keep this opt-in extension
// reproducible; fail on upstream changes instead of silently patching new code.
const upstream = new URL("../node_modules/webamp/built/webamp.lazy-bundle.js", import.meta.url);
const { version } = JSON.parse(await readFile(new URL("../node_modules/webamp/package.json", import.meta.url), "utf8"));
if (version !== "2.3.1") throw new Error(`Unsupported Webamp version: ${version}`);
let source = await readFile(upstream, "utf8");
function replaceOnce(before, after) {
  if (source.split(before).length !== 2) {
    throw new Error(`Webamp 2.3.1 patch no longer matches: ${before.slice(0, 80)}`);
  }
  source = source.replace(before, after);
}

replaceOnce(
  "function App({ media, filePickers, onMount, parentDomNode, }) {",
  `// EricOS: native GenWindow chrome with a stable, media-owned content mount.
  function EmbeddedMediaWindow({ media, open }) {
    const mount = reactExports.useCallback(node => media.mountVideoWindow(node), [media]);
    return jsxRuntimeExports.jsx("div", {
      className: "ericos-video-window",
      style: { display: open ? "block" : "none" },
      role: "region",
      "aria-label": "YouTube player",
      children: jsxRuntimeExports.jsx(GenWindow, {
        title: "YouTube",
        windowId: WINDOWS.MILKDROP,
        children: () => jsxRuntimeExports.jsxs("div", {
          className: "ericos-video-content",
          children: [
            jsxRuntimeExports.jsx("div", {
              className: "ericos-video-player",
              ref: mount
            }),
            jsxRuntimeExports.jsx("div", {
              className: "ericos-video-drag-surface draggable",
              role: "img",
              "aria-label": "YouTube video. Drag to move the window; use Winamp for playback.",
              title: "Drag to move or detach the YouTube window"
            })
          ]
        })
      })
    });
  }
  function App({ media, filePickers, onMount, parentDomNode, }) {`
);
replaceOnce(
  "return objectMap(genWindowsInfo, (w, id) => {",
  `return objectMap(genWindowsInfo, (w, id) => {
    if (id === WINDOWS.MILKDROP && typeof media.mountVideoWindow === "function") {
      return jsxRuntimeExports.jsx(EmbeddedMediaWindow, { media, open: w.open });
    }`
);
// Closed content stays mounted, but must not be a phantom snap/drag target.
replaceOnce(
  "const getWindowHidden = createSelector_1(getMilkdropWindowEnabled, (milkdropWindowEnabled) => {",
  "const getWindowHidden = createSelector_1(getMilkdropWindowEnabled, getWindowOpen, (milkdropWindowEnabled, getOpen) => {"
);
replaceOnce(
  "return windowId === WINDOWS.MILKDROP && !milkdropWindowEnabled;",
  "return !getOpen(windowId) || (windowId === WINDOWS.MILKDROP && !milkdropWindowEnabled);"
);
// Minimize/restore must not reload the YouTube iframe either.
replaceOnce(
  "if (closed) {\n\t        return null;\n\t    }\n\t    return ReactDOM$2.createPortal",
  "if (closed && typeof media.mountVideoWindow !== \"function\") {\n\t        return null;\n\t    }\n\t    return ReactDOM$2.createPortal"
);
replaceOnce(
  'jsxRuntimeExports.jsxs("div", { onBlur: handleBlur, children:',
  'jsxRuntimeExports.jsxs("div", { style: { display: closed ? "none" : undefined }, onBlur: handleBlur, children:'
);
// WindowManager normally raises windows by reordering keyed DOM nodes. Moving
// an ancestor reloads cross-origin iframes. Keep DOM order stable and express
// the same native stacking order with z-index instead.
replaceOnce(
  "const windows = windowsInfo.filter((w) => propsWindows[w.key]);",
  `const windows = windowsInfo.filter((w) => propsWindows[w.key])
    .map((w, stackOrder) => ({ ...w, stackOrder }))
    .sort((a, b) => a.key.localeCompare(b.key));`
);
replaceOnce(
  'transform: `translate(${w.x}px, ${w.y}px)`,',
  'transform: `translate(${w.x}px, ${w.y}px)`, zIndex: w.stackOrder,'
);
// Resizing should preserve the same attachment graph as shading/double-size.
// Hidden windows (especially the closed equalizer behind the playlist) must
// not take precedence over visible attachment edges.
replaceOnce(
  "const getWindowGraph = createSelector_1(getWindowsInfo, generateGraph);",
  `const getWindowGraph = createSelector_1(getWindowsInfo, getWindowOpen, getWindowHidden,
    (windows, getOpen, getHidden) => generateGraph(windows.filter(w => getOpen(w.key) && !getHidden(w.key))));`
);
replaceOnce(
  "const newPositions = objectMap(windowPositions, (position, key) => applyDiff(position, positionDiff[key]));",
  "const newPositions = objectMap(windowPositions, (position, key) => positionDiff[key] ? applyDiff(position, positionDiff[key]) : position);"
);
replaceOnce(
  'return { type: "WINDOW_SIZE_CHANGED", windowId, size };',
  'return withWindowGraphIntegrity({ type: "WINDOW_SIZE_CHANGED", windowId, size });'
);

// The lazy distribution omits the prebuilt, outdated metadata parser. Replace
// its embedded Lodash helpers too, then bundle both from our audited lockfile.
const lodashStart = source.indexOf("\t/**\n\t * The base implementation of `_.propertyOf`");
const lodashEnd = source.indexOf("\tconst characterClassName =");
if (lodashStart === -1 || lodashEnd <= lodashStart ||
    !source.slice(lodashStart, lodashEnd).includes("var deburr$1 =")) {
  throw new Error("Webamp 2.3.1 Lodash boundary no longer matches");
}
source = source.slice(0, lodashStart) + "\tconst deburr$1 = patchedDeburr;\n\n" + source.slice(lodashEnd);
const entry = `
import JSZip from "jszip/dist/jszip.min.js";
import * as musicMetadata from "music-metadata";
import patchedDeburr from "lodash/deburr.js";
${source}
const WebampLazy = window.Webamp;
window.Webamp = class Webamp extends WebampLazy {
  constructor(options) {
    super({ ...options,
      requireJSZip: async () => JSZip,
      requireMusicMetadata: async () => musicMetadata,
    });
  }
};
`;
const { outputFiles } = await build({
  stdin: { contents: entry, resolveDir: new URL("..", import.meta.url).pathname },
  bundle: true,
  platform: "browser",
  format: "iife",
  minify: true,
  legalComments: "eof",
  write: false,
  banner: { js: "/* Webamp 2.3.1 + EricOS embedded media window. Regenerate: npm run vendor:webamp */" },
});
await writeFile(new URL("../public/vendor/webamp.bundle.min.js", import.meta.url), outputFiles[0].text.replace(/^[ \t]+$/gm, ""));

// Track libraries already embedded in the upstream lazy bundle as well as the
// dependencies installed via npm. OSV can scan this alongside package-lock.json.
const map = JSON.parse(await readFile(new URL("../node_modules/webamp/built/webamp.lazy-bundle.js.map", import.meta.url), "utf8"));
const libraries = new Map();
for (const path of map.sources) {
  if (!path.includes("/node_modules/.pnpm/")) continue;
  const part = path.split("/node_modules/.pnpm/")[1];
  const segments = part.split("/node_modules/")[1].split("/");
  const name = segments[0].startsWith("@") ? segments.slice(0, 2).join("/") : segments[0];
  if (name === "lodash") continue; // Removed above; the patched copy is in the lockfile.
  const version = part.split("/")[0].slice(name.replace("/", "+").length + 1).split("_")[0];
  libraries.set(name + "@" + version, { type: "library", name, version,
    purl: `pkg:npm/${name.replace("@", "%40")}@${version}` });
}
await writeFile(new URL("../public/vendor/webamp.cdx.json", import.meta.url), JSON.stringify({
  bomFormat: "CycloneDX", specVersion: "1.5", version: 1,
  components: [...libraries.values()].sort((a, b) => a.name.localeCompare(b.name) || a.version.localeCompare(b.version)),
}, null, 2) + "\n");
