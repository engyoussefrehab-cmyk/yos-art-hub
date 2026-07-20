
# Standalone CMS Rebuild — Extended Plan (v3, final)

Full CMS reboot at `/admin` — Webflow/Sanity-grade shell, isolated from the public site, universal versioning, English-only, gradual module migration. Public site UI is not touched by CMS work; a parallel UX Audit track owns any public-site changes.

## Guiding Principles

- **Public site untouched by CMS work.** Reads only.
- **CMS isolated.** Own layout, sidebar, header, theme, routes (`/admin/*`), auth, state, English-only i18n.
- **Gradual migration.** Existing modules keep working through a compatibility layer; each is audited (keep / refactor / rebuild).
- **Universal schema.** Every editable entity plugs into revisions, autosave, soft-delete, audit, permissions, workflow states, dependencies, preview.
- **No hardcoded content.** Categories, layouts, homepage, navigation, footer, sections, forms, themes — all defined in DB.
- **Zero code for content changes.** New category → new template + layout auto-generated. New form → drag-and-drop builder. New homepage block → picker. New nav item → suggested.
- **Longevity over convenience.** Every decision optimizes for a platform that keeps growing for years.
- **Registry-driven.** New entities, blocks, and settings pages plug in via registries — no bespoke CRUD, no shell edits. See `docs/ARCHITECTURE.md`.
- **API-first.** Every module is a server-function surface reusable by a future client portal, mobile app, or external integration.
- **Feature-flagged.** Every in-flight module ships behind a `cms.*` flag (`cms_feature_flags`).
- **Eventful.** Durable `cms_events` log powers automations and integrations; DB triggers emit `published`, `updated`, `lead.created`, `form.submitted`, `media.deleted`, `workflow_changed`.
- **Universal settings.** `cms_settings_groups` + `cms_settings_values` host General / Branding / SEO / Email / Storage / Integrations / Analytics / Social / Scripts, and any future module can register its own.
- **Performance-aware.** Lazy blocks, paginated queries, virtualized lists, cached flags/settings — enforced from Phase 0.
- **Server-validated + audited.** RLS is the floor; every mutation flows through `createServerFn` with role check + `cms_audit_log`.

---

## Phase 0 — Foundation

### 0.1 Universal CMS primitives (single migration; all with GRANTs + RLS + `has_role` policies)

- `cms_entity_types` — registry: `key, label, table_name, pk_column, slug_column, has_i18n, preview_path_template, supports_workflow, supports_versioning, deletable`.
- `cms_revisions` — universal versioning: JSON-patch diffs, full snapshots on publish / every Nth version; states `draft | autosave | checkpoint | published`.
- `cms_autosaves` — transient per-user drafts, promoted to revisions on session end.
- `cms_audit_log` — supersedes `audit_logs`.
- `cms_permissions` — role × entity × actions matrix.
- `cms_locks` — optimistic edit locks per `(entity_type, entity_id, user_id)`.
- Universal `deleted_at` on every editable table + RLS.
- **Workflow states** (v2 §4): `workflow_state` enum `draft | in_review | approved | published | archived` + `state_history jsonb` + `cms_workflow_transitions` (role → allowed transitions).
- **Reusable blocks & global components** (v2 §2,§3): `cms_reusable_blocks`, `cms_global_components` (CTA, Testimonials, Statistics, FAQ, Client Logos, Partners, Footer CTA, Hero Banner, Newsletter, Numbers, Awards, Brand Logos). Editing a component updates every page using it.
- **Design tokens** (v2 §6): `cms_design_tokens` — colors, typography scale, spacing, radius, shadows, transitions, container widths, button variants, icons, animation presets. Compiled to CSS variables the public site reads at runtime.
- **Theme presets** (v3 §3): `cms_theme_presets` — named token bundles (Default, Minimal, Enterprise, Luxury, Dark). Applying a preset overwrites tokens; presets are themselves versioned and duplicable.
- **Pages, homepage & category layouts** (v2 §9 + v3 §1): every page (including `/`, header, footer) is a `pages` row with `blocks[]`. `cms_category_templates` becomes `cms_category_templates` (content) + `cms_category_layouts` (structure/section order/allowed blocks). Both auto-generated when a category is created; a project inside a category inherits both, editable per-project.
- **Forms builder** (v2 §7): `cms_forms`, `cms_form_fields`, `cms_form_submissions`.
- **Leads / CRM** (v2 §10): `crm_leads` with pipeline states, follow-ups, meeting dates, tags, assignments; every submission triggers a lead row.
- **Media library upgrade** (v2 §11): `media_folders` nested via `parent_id`; seed default folders (Projects, Articles, Services, Clients, Testimonials, Downloads, Brand Assets, Icons, Logos, Documents).
- **Backup center** (v2 §13): `cms_backups` (manual + scheduled via `pg_cron`) to a private `cms-backups` Storage bucket.
- **Smart relations** (v2 §8): `cms_related_content` populated by a nightly embedding-similarity job + manual overrides.
- **Search index** (v2 §14): `cms_search_index` materialized view over all entities, refreshed on write; drives universal `⌘K` search.
- **Navigation** (v3 §2,§4): `cms_navigations` (`location` enum `header | footer | mobile | sidebar | mega`), `cms_navigation_items` (nested via `parent_id`, `entity_type` + `entity_id` for internal links, `href` for external, `icon`, `visibility_rules jsonb`, `sort_order`). All navigation on the site reads from these.
- **Suggested nav items** (v3 §4): DB trigger writes to `cms_nav_suggestions` on every create for Project / Service / Category / Article / Page; UI surfaces "Add to navigation" one-click include.
- **Media usage tracking** (v3 §5): `cms_media_usages` (`asset_id, entity_type, entity_id, field_path`) auto-maintained by triggers scanning `layout_blocks` / rich text / cover columns on every write.
- **Universal dependency graph** (v3 §6): `cms_dependencies` (`from_entity, to_entity, from_field, kind`) — a normalized edge table maintained by the same trigger machinery that powers media usage. Every delete queries this before proceeding.
- **Portfolio highlight flags** (v3 §7): `portfolio_projects` gains `is_featured, is_homepage_featured, is_best_work, is_award_winner, is_recommended, is_hidden, is_pinned, highlight_sort` — homepage & category pages read these; no hardcoded selections in code.

Trigger `cms_write_revision()` fires BEFORE UPDATE on every registered table.

### 0.2 Auth — standalone admin experience

- Routes: `/admin/login | forgot | reset | verify`. Fully separate UI from public auth.
- `_admin` pathless layout gate: `ssr:false`, unauthenticated → `/admin/login`, authenticated on `/admin/login` → `/admin/dashboard`.
- Supabase Auth under the hood. Roles: `admin | editor | author | reviewer`.
- Idle timeout, re-auth on destructive ops, password reset, email verification.

### 0.3 CMS shell (isolated design system)

`src/admin/` — separate from `src/components` / `src/views`.

- `layout/` — `AdminShell`, `AdminSidebar`, `AdminHeader`, `AdminBreadcrumbs`, `CommandPalette`, `SplitPreview` (v2 §15).
- `ui/` — admin-only tokens: data-table, form field, drawer, dialog, diff viewer, block picker, DnD list, dependency dialog, media picker.
- `hooks/` — `useEntity, useRevisions, useAutosave, useUndoRedo, usePermissions, useKeyboardShortcuts, useBulkSelection, useSoftDelete, useWorkflow, useSplitPreview, useAiAssist, useDependencies, useMediaUsage, useNavSuggestions`.
- `lib/` — `entity-registry.ts` (schema + list columns + form fields + workflow + preview route + i18n fields + related-content rules + AI targets + dependency scanners), `cms.functions.ts` (generic CRUD + revisions + trash + workflow + dependency check), `blocks-registry.ts`, `components-registry.ts`, `layouts-registry.ts` (v3 §1), `themes.functions.ts` (v3 §3), `nav.functions.ts` (v3 §2,§4), `dependencies.functions.ts` (v3 §6), `ai-assist.functions.ts`, `search.functions.ts`, `backups.functions.ts`.
- English-only admin i18n.

### 0.4 Blocks system (v2 §2)

Universal block registry used by projects, articles, pages, homepage, category layouts:

**Content:** Hero, Text, Rich Text, Quote, Divider, Columns, Image, Gallery, Video, Embed, Custom HTML.
**Structured:** Timeline, FAQ, Statistics, Pricing, Numbers, Awards.
**Social proof:** Testimonials, Client Logos, Brand Logos, Partners.
**Conversion:** CTA, Footer CTA, Newsletter, Hero Banner.
**Project-specific:** Approach/Methodology, Meta, Deliverables, Palette, Typography, Links, Before-After, Next-Project.
**Category-layout-specific (v3 §1):** Overview, Challenge, Research, Strategy, Naming, Applications, Results, Objectives, Audience, Structure, Slides Gallery, Visual Direction, Charts, Brief, Art Direction, Shooting, Editing, Structural Design, Visual Design, Production, Mockups.

Every block supports: drag-and-drop, duplicate, hide, reorder, per-locale visibility, save-as-reusable, insert-reusable.

### 0.5 Category Templates + Layouts (v2 §1 + v3 §1)

- Every `project_categories` row owns:
  - `cms_category_templates` — default methodology, default CTA, default SEO template with tokens (`{project_name}`, `{category}`), default related-content rules.
  - `cms_category_layouts` — ordered `blocks[]` skeleton (the section list per category from the user's spec: Brand Identity, Presentation Design, Photography, Packaging, extendable), plus `allowed_blocks[]`, `locked_blocks[]`.
- Seeded for existing categories; new category clones a base template + base layout, then diverges.
- Creating a project inherits both; author edits per-project without code.
- Editable at `/admin/categories/$id/template` and `/admin/categories/$id/layout`.

### 0.6 Homepage Builder (v2 §9)

- Homepage = `pages` row with `blocks[]`. Public `/` renders from DB.
- Featured-project selectors (v3 §7) read `is_homepage_featured` + `highlight_sort`; homepage block "Featured Projects" is a dynamic query, not a hardcoded list.
- Zero home layout in source.

### 0.7 Navigation Builder (v3 §2,§4)

- `/admin/navigation` — one page per location (Header, Footer, Mobile, Sidebar, Mega). Tree view with drag-and-drop nesting, icon picker, visibility rules (locale, role, auth state, device).
- Items link to internal entities (typeahead over `cms_search_index`) or external URLs.
- **Auto-suggestions** (§4): whenever a Project / Service / Category / Article / Page is created, a suggestion row appears in the nav builder side panel — one click to include, dismiss, or ignore.
- Public site header/footer/mobile nav read entirely from this system. No hardcoded navigation.

### 0.8 Cross-cutting features (delivered once, reused everywhere)

- **Dashboard Overview** — recent activity, pending drafts, in-review queue, scheduled publishes, unread messages, leads pipeline, storage, site health.
- **Universal Search** (v2 §14) — `⌘K` over `cms_search_index`.
- **Activity Log**, **Trash**, **Version History drawer** with side-by-side diff + restore + manual checkpoint.
- **Autosave + Undo/Redo** on every form.
- **Bulk actions**, **pagination**, **filters**, **saved views**.
- **Workflow transitions** (Draft / In-Review / Approved / Published / Archived) gated by role.
- **Keyboard shortcuts**, **quick search**, **duplicate**, **preview**, **restore**, **soft delete**.
- **CMS-scoped notifications** (toaster separate from public site).
- **Media Library refactor** (v2 §11 + v3 §5) — folder tree, drag between folders, unified picker, **usage panel per asset** ("Used in: Homepage, Project A, Article B, CTA Section") powered by `cms_media_usages`.
- **SEO Manager** — page/entity-level; templates per category applied automatically with token substitution.
- **Analytics Dashboard** — traffic, top pages, top projects, form conversions, lead pipeline, search terms.
- **Settings** — General, Branding, Design Tokens + **Theme Presets** (v3 §3), SEO defaults, Roles/Users, Integrations, Backups, Email, Webhooks.
- **Backup Center** (v2 §13) — manual + scheduled backups, restore points, one-click rollback, downloadable archive.
- **Live Preview / Split View** (v2 §15).
- **AI Assist** (v2 §5) — Generate button on every text field: SEO title/desc, excerpt, summary, alt text, keywords, meta, social captions, FAQ, project summary, service description; improve, rewrite, translate (ar↔en), expand, shorten, tone adjust. Backed by Lovable AI (`google/gemini-3-flash-preview` default; `google/gemini-2.5-pro` for long-form).
- **Internal Linking Assistant** (v2 §12) — inline suggestions from `cms_related_content` + `cms_search_index`.
- **Smart Relations** (v2 §8) — nightly embedding job + manual overrides.
- **Forms Builder** (v2 §7) — drag-and-drop fields, validation, conditional visibility, notifications, webhooks. Every submission → `crm_leads`.
- **CRM / Leads** (v2 §10) — Kanban pipeline, lead detail with notes/activity/tags/assignments, follow-up + meeting dates, won/lost.
- **Portfolio Highlight System** (v3 §7) — dedicated tab in every project editor exposing all highlight flags; homepage & category views consume the flags. No project ever hardcoded in code.
- **Dependency Checker** (v3 §6) — every delete opens a modal listing every entity that references the target (from `cms_dependencies` + `cms_media_usages`). Actions: **Cancel**, **Replace Dependency** (choose replacement entity — bulk-rewrites the edges), **Force Delete** (admin-only, writes an audit entry). Same UI is reused for Project / Service / Category / Component / Image / Form / Page / Navigation item / Reusable block.

---

## Phase 1 — Module migration

Each module audited (Keep / Refactor / Rebuild). Content, URLs, slugs, translations, SEO, published state preserved. Zero downtime; old routes 301.

| Module               | Verdict                                                        |
| -------------------- | -------------------------------------------------------------- |
| Projects             | Refactor — registry, versioning, template inherit, highlights  |
| Project Categories   | Refactor + Template tab + **Layout tab (v3 §1)**              |
| Services             | Rebuild                                                        |
| Service Categories   | Build                                                          |
| Articles (Insights)  | Refactor — migrate `article_revisions` → `cms_revisions`        |
| Pages                | Rebuild on blocks system                                       |
| Homepage             | Rebuild as builder                                             |
| Testimonials         | Keep + wrap; expose as Global Component                        |
| FAQs                 | Extract as module + Global Component                           |
| **Navigation**       | **Rebuild as Navigation Builder (v3 §2)**                     |
| Site Sections        | Deprecate — absorbed by blocks                                 |
| Global Settings      | Refactor                                                       |
| Design Tokens        | New                                                            |
| **Theme Presets**    | **New (v3 §3)**                                                |
| SEO Manager          | Rebuild (unified)                                              |
| Forms                | Rebuild as builder                                             |
| Leads                | New                                                            |
| Media                | Refactor with folders + **usage tracking (v3 §5)**             |
| Reusable Blocks      | New                                                            |
| Global Components    | New                                                            |
| Backups              | New                                                            |
| Analytics            | New                                                            |
| Users & Roles        | New                                                            |
| **Dependency Center**| **New (v3 §6) — reachable from every entity's delete action** |

---

## Phase 2 — Polish

- Scheduled publishing (`pg_cron` → server route).
- Two-version side-by-side compare UI (full wire-up).
- Localization workflow with AI-assist.
- Import/export per entity (JSON + CSV).
- Webhook retry dashboard.

---

## Client Experience Audit (parallel track — item 16 from v2)

Reviewed from six lenses (Creative Director, Brand Strategist, Senior UX, Senior UI, Marketing Consultant, Enterprise Product Designer). Delivers `.lovable/ux-audit.md` + a prioritized changeset. Because v3 makes tokens, blocks, homepage, navigation, forms, and category layouts fully dynamic, most audit findings resolve as **content changes inside the new CMS**, not code.

---

## What ships first (Phase 0 PR)

1. All Phase 0 migrations (registry, revisions, autosave, audit, permissions, locks, soft-delete, workflow, reusable blocks, global components, design tokens, **theme presets**, templates, **category layouts**, **navigations + nav suggestions**, forms, leads, media folders + **usages**, **dependencies**, **highlight flags**, backups, related-content, search index).
2. `src/admin/` scaffolding + `_admin` layout + `/admin/login|forgot|reset|verify`.
3. Dashboard, Command Palette, Universal Search, Activity Log, Trash, Version History drawer.
4. Universal data table + entity registry (Projects, Articles, Services smoke test).
5. Blocks registry + Global Components + Reusable Blocks module.
6. Category Templates **and Layouts** editors (seeded).
7. Homepage Builder.
8. **Navigation Builder** with auto-suggestions.
9. Forms Builder + Leads pipeline (contact form migrated).
10. Design Tokens + Theme Presets settings; public-site tokens consumer.
11. Media Library with folders + usage panel.
12. Backup Center.
13. AI Assist backend + editor menu.
14. Internal Linking Assistant + Smart Relations job.
15. Split-view Live Preview.
16. **Dependency Checker** wired into every delete.
17. **Portfolio Highlight System** in project editor + homepage consumer.
18. Redirects from every old `/admin/*` to the new equivalent; legacy editors kept behind a compatibility wrapper until Phase 1 migrates each.

Public site untouched by CMS PR (except reading new tables — no visual change).

---

## Verification checklist (end of Phase 0)

- Public site pixel-identical (screenshot diff on `/`, `/projects`, `/insights`, `/contact`).
- Every existing `/admin/*` URL works or 301s.
- All existing content visible in new list views; no data loss.
- Version drawer shows history for Projects, Articles, Services.
- New category auto-creates its template **and layout**; new project inherits both.
- Homepage renders from `pages.blocks`; featured projects sourced from highlight flags — no hardcoded home layout or project list remains.
- Header / Footer / Mobile navigation all render from `cms_navigations` — no hardcoded nav items.
- Applying a Theme Preset in `/admin/settings/themes` changes the public site immediately without a code deploy.
- Contact form is one row in `cms_forms`; submission creates a `crm_leads` row.
- Universal search returns results across projects, articles, services, categories, testimonials, media, pages, forms, settings, users, leads, nav items.
- Split-view preview updates on autosave.
- AI Assist works on at least SEO title/description, excerpt, alt text.
- Deleting any Project / Service / Category / Component / Image / Form / Page opens the Dependency Checker with an accurate list; Force Delete is admin-only and audited.
- Media asset shows "Used in" panel with real usages.
- Creating a new project/service/category/article/page emits a nav suggestion in the Navigation Builder.
- No console errors on admin or public routes; build passes; legacy `src/components/admin/*` marked deprecated with imports rerouted.

---

Approve v3 and I'll begin Phase 0: migration + admin shell scaffolding. UX audit will spin up as a parallel doc — say the word if you want it started in the same turn or held until Phase 0 lands.
