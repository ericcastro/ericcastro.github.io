# EricOS 95

[EricOS 95](https://eric.cast.ro/) is my personal website, disguised as a tiny Windows 95 desktop. It is both a project in its own right and a home for the things I build, think about and enjoy, with plenty of retro computing nostalgia and old-web jokes.

## On the site

- **About me:** my background, interests and life outside work.
- **Projects:** software, electronics and other experiments, finished or otherwise.
- **Blog:** project updates, personal stories and occasional observations.
- **Links:** places to find me and things worth visiting elsewhere on the web.

## On the desktop

- **Internet Ersplorer:** a browser inside the browser, with an address bar and navigation history.
- **Clippy:** contextual explanations and commentary as you explore.
- **RETRUCO.EXE:** a playable JavaScript reimplementation of a 1996 Argentine Truco card game.
- **WINAMP.EXE:** a Webamp player whose playlist comes from my recent [Last.fm listening history](https://www.last.fm/user/eric_castro), with YouTube playback when a match is available.
- **The surrounding OS:** draggable windows, a Start menu, taskbar, command prompt, editable notepad and dark mode.

## Development

Built with Astro and deployed as a static site on GitHub Pages. Personal content lives in `src/content/` as Markdown; the desktop interface lives in `src/pages/`, `src/styles/` and `public/scripts/`.

Use Node.js 24 (`nvm use` if you use nvm):

```bash
npm ci
npm run dev
```

Run `npm run build` to generate the site in `dist/`. The build also regenerates the customized Webamp bundle using [scripts/build-webamp.mjs](scripts/build-webamp.mjs).

Check dependencies with `npm audit` and `osv-scanner scan -r .`; the latter also checks the inventory of libraries embedded in Webamp.
