# yrstudio.art — موقع يوسف رحاب

Static portfolio site for Youssef Rehab (YR Studio), hosted on GitHub Pages at **https://yrstudio.art**.

## How it works

- Built with React + TanStack Start, **prerendered to plain HTML** — no server, no database.
- All content (projects, categories, services, packages, methodology, settings…) lives in
  **`src/data/snapshot/*.json`**. Edit a file there to change the site.
- Images and files live in **`public/media/`** (portfolio covers, logo, portrait, PDF).
- `src/lib/static-db/` reads the JSON files with the same queries the pages always used.
- Contact form messages are sent by email through Web3Forms (key in `src/lib/site.ts`).

## Publishing

Every push to `main` runs `.github/workflows/deploy.yml`, which builds the site and
publishes `dist/client` to GitHub Pages. Nothing else to do.

## Local development

```sh
bun install
bun run dev      # local preview
bun run build    # static build into dist/client
```
