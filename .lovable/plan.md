# Full CMS control over Project Details page

## Current gaps (from audit)

The public project page (`src/views/ProjectDetailView.tsx`) mixes three data sources today:

1. **Dynamic blocks** — `layout_blocks` JSONB, drag-and-drop, per-block show/hide. Works well.
2. **Hardcoded frontend sections** — breadcrumb category label, "Specialty / Type" info card, "How We Built the Identity" (Approach) section, "Next Project" CTA. Section titles/kickers live in `i18n/dictionary.ts`, not in the DB.
3. **Orphaned DB columns** — `brand_colors`, `typography`, `deliverables`, `client`, `role`, `team`, `duration`, `year`, `project_url`, `behance_url`, `figma_url`, `stats`, `testimonial`, `videos`, `embeds`, `seo_*`. The admin editor lets you fill many of these, but `mapRow()` in `src/lib/portfolio.functions.ts` drops them so nothing renders. `stats`/`testimonial`/`videos`/`embeds` have no admin UI at all.

Goal: `layout_blocks` becomes the **single source of truth** for the body. Legacy fields either feed a block or are removed from the render path.

## Approach

Consolidate everything into the block system that already supports drag-and-drop, per-block visibility, and localized content. Add the missing block types, remove hardcoded sections, and use the SEO columns in `head()`.

## Changes

### 1. New / upgraded block types (`src/lib/project-block-templates.ts` + `ProjectBlocksRenderer.tsx` + `ProjectBlocksEditor.tsx`)

Add these block types with full show/hide, title, subtitle, and content editing:

- `approach` — replaces the hardcoded "How We Built the Identity" section. Editable kicker, title, bullet list, optional highlighted "value" box. No more parsing of `solution_ar/en` bullets.
- `meta` — client, role, team, duration, year, country. Displayed as an info grid; admin picks which fields to show.
- `deliverables` — bilingual list with icons.
- `palette` — already exists but upgrade to read from `brand_colors` column shape (name + hex + optional token).
- `typography` — heading font, body font, optional sample text.
- `links` — external buttons: live site, Behance, Figma, custom.
- `stats` — already a block; keep as-is but also mount the schema `stats` column here (migrate on read).
- `testimonial` — quote, author, role, avatar, rating.
- `video` — hosted MP4 or embed URL (already partially there; extend).
- `embed` — raw iframe (YouTube/Vimeo/Framer) with safe allowlist.
- `hero` — first-class hero block controlling title, kicker, industry chip, short description, cover image, and the "Specialty / Type" info card (with per-label editable text). One `hero` block is auto-inserted for existing projects during migration.
- `next-project` — CTA. Toggleable, custom label.

Every block already has `enabled: boolean` for show/hide and drag handles for ordering — reused as-is.

### 2. Public page refactor (`src/views/ProjectDetailView.tsx`)

Reduce the view to:

```
<Breadcrumb />           // category label from project_categories table, not CAT_LABELS
<ProjectBlocksRenderer blocks={project.layout_blocks} />
```

Remove: hardcoded hero JSX, "Specialty / Type" `<dl>`, "Approach" section, cover image block, legacy gallery fallback, hardcoded "Next Project" CTA, `CAT_LABELS` map. All become blocks.

### 3. Data layer (`src/lib/portfolio.functions.ts`)

- Extend `mapRow()` to surface every column the block editor consumes: `brand_colors`, `typography`, `deliverables`, `client`, `role`, `team`, `duration`, `year`, `project_url`, `behance_url`, `figma_url`, `stats`, `testimonial`, `videos`, `embeds`, `seo_*`, and the joined category label from `project_categories`.
- On read, if `layout_blocks` is empty or missing the new block types, synthesize a default block list from legacy columns (hero + approach + palette + typography + deliverables + links + gallery + next-project). This keeps existing projects looking right without a data migration, and the admin can save to persist the blocks.

### 4. Admin editor (`src/components/admin/AdminPortfolioEditorView.tsx` + block editors)

- Add "Add block" entries in the block picker for every new type above.
- Move the standalone form fields (client/role/team/duration/brand_colors/typography/deliverables/links) into read-only "legacy fields" — still editable, but a "Convert to blocks" button generates the corresponding blocks and clears the legacy fields. New projects skip legacy fields entirely and use blocks only.
- SEO fields (`seo_title_*`, `seo_description_*`, `seo_keywords`, `og_image_url`) stay as project-level fields (they're not sections), and the route `head()` starts consuming them.

### 5. SEO (`src/routes/projects.$category.$slug.tsx`)

`head()` reads `seo_title_ar/en`, `seo_description_ar/en`, `og_image_url` with fallbacks to `name`/`short_description`/`thumbnail_url`.

### 6. Category labels

Replace `CAT_LABELS` in `ProjectDetailView.tsx` with a lookup against `project_categories` (already fetched by `listCategories`). Passed through loader data.

## Out of scope

- No schema changes — every column already exists.
- No changes to the Projects listing, Home slider, or admin projects list.
- Testimonials CMS page (separate from per-project testimonial block) untouched.

## Technical notes

- Block enabled/disabled and drag order are already implemented in `ProjectBlocksEditor` via `@dnd-kit/*`; new block types plug into the existing registry.
- Backfill logic in `mapRow` is idempotent: it only synthesizes defaults when `layout_blocks` is empty/absent for a given block kind.
- `ZoomableImage` continues to wrap images inside blocks (mobile pinch-zoom is unchanged).
- i18n dictionary keys for section titles become defaults inside each block template's `title_ar/en`, so existing translations survive as seed values — admins can override per project.

## Verification

After implementation:
1. Existing published project renders identically without any admin action (thanks to `mapRow` synthesis).
2. In the admin editor, every visible section on the public page has a corresponding block card with show/hide, edit, delete, drag.
3. Grepping `src/views/ProjectDetailView.tsx` shows no bilingual copy strings for section headings — only structural JSX.
4. SEO tab in admin controls the `<head>` tags of the public project page.
