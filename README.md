# EricOS 95

Personal site.

Built with Astro.

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
