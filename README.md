# EricOS 95

Static personal site built with Astro for deployment to GitHub Pages.

## Framework

This project uses [Astro](https://astro.build/). It is a good fit here because:

- it builds to plain static HTML, CSS, and JavaScript
- it keeps the project lightweight for GitHub Pages
- it lets the page stay mostly hand-authored markup instead of forcing a client-heavy app

## Project structure

- `src/pages/index.astro`: main page markup
- `src/content/about/bio.md`: about/profile content
- `src/content/posts/*.md`: homepage posts
- `src/content/projects/*.md`: project cards in the Paint window
- `src/content.config.ts`: content collection schemas
- `src/styles/global.css`: extracted global styles
- `public/scripts/desktop.js`: desktop window behavior
- `public/CNAME`: custom domain for GitHub Pages
- `.github/workflows/deploy.yml`: GitHub Pages deployment workflow

## Editing content

Update content through Markdown files instead of editing the page template:

- edit `src/content/about/bio.md` for the Bio.txt window
- add or edit files in `src/content/posts/` for homepage posts
- add or edit files in `src/content/projects/` for project cards

The page layout still lives in `src/pages/index.astro`, but normal content updates should happen in Markdown.

## Local development

Install dependencies:

```bash
npm install
```

Run the local dev server:

```bash
npm run dev
```

## Build

Compile the static site:

```bash
npm run build
```

Astro writes the production-ready output to `dist/`.

## Deploy to GitHub Pages

1. Push this repository to GitHub.
2. In the repository settings, open `Pages`.
3. Set the source to `GitHub Actions`.
4. Push to `main` and the workflow will build and deploy the contents of `dist/`.

The custom domain is preserved through `public/CNAME`.
