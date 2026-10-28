# EricOS 95

Personal site.

Built with Astro. Use Node.js 24 (`nvm use`) and install with `npm ci`.

The desktop Winamp widget uses Webamp 2.3.1's native Milkdrop `GenWindow` for
YouTube playback. Dragging, snapping, resizing and window focus stay in Webamp.
The YouTube media bridge supplies only the content and playback controls.

`scripts/build-webamp.mjs` applies a small extension to the installed Webamp
bundle. It keeps the video content mounted when its window is closed and keeps
window DOM order stable, using z-index for stacking instead. Moving an iframe's
ancestor in the DOM otherwise reloads its original video on focus changes.
The desktop bridge fills the desktop at `0,0` and passes pointer input through
its empty space; Webamp owns all window coordinates.

The bundle uses Webamp's lazy distribution and builds its metadata parser, ZIP
library and Lodash helpers from the audited npm lockfile. The accompanying
`public/vendor/webamp.cdx.json` inventories the remaining embedded libraries.

Regenerate the checked-in bundle after changing the extension:

```bash
npm run vendor:webamp
```

`npm run build` also regenerates it. Check dependencies, including embedded
libraries, with `osv-scanner scan -r .` and `npm audit`.

Double-click the spectrum analyzer (or focus it and press Enter) to reopen the
YouTube window. Closing that window keeps audio playing. Closing or minimizing
Winamp pauses playback.

Playback controls are provided by Winamp. The video has a transparent native
drag surface, so dragging the picture detaches or moves the YouTube window.
Resizing uses Webamp's existing attachment graph to move snapped windows with
the resized edge. Closed/hidden windows are excluded from that graph.

The website disables YouTube's standard controls with `controls=0`. Removing
its remaining transient overlays in DJ Scrobbler requires Electron to inject
CSS inside the YouTube frame; that approach is unavailable to this site's
cross-origin browser embed.

The `public/mewamp/` player also uses Cloudflare Pages Functions for:

- proxying Last.fm recent tracks without exposing the API key
- short-lived edge caching of Last.fm responses
- server-side YouTube search fallback

Content lives mostly in:

- `src/content/about/`
- `src/content/posts/`
- `src/content/projects/`

Useful commands:

```bash
npm run dev
npm run build
```

Cloudflare Pages local function testing:

1. Create a local secrets file from `.dev.vars.example`.
2. Run `npm run build`.
3. Run `npm run pages:dev`.
4. Open `http://localhost:8788/mewamp/`.

Notes:

- `wrangler pages dev dist` serves the built static assets and runs the `/functions` routes locally.
- `astro dev` alone will not execute the Pages Functions.
