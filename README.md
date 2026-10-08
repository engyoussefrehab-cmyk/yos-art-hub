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

## Dashboard (yrstudio.art/admin)

A custom control panel to edit every text, project, image, package, article and
setting on the site. Sign in with a GitHub fine-grained token (repo `yos-art-hub`,
Contents: read & write, Actions: read). Edits are kept as drafts in the browser;
"نشر التعديلات" saves them as one commit, and the site redeploys in ~2 minutes.

- Code: `src/admin/` (schema.ts lists every editable file and field)
- Uploaded images are converted in the browser to WebP (max 2560px, q0.9) with a
  JPEG twin under `public/media/share/` for link previews.
