# Full Admin CMS — Build Plan

This is a large scope (schema + storage + admin UI + rewiring every public page to read from the database + AI helpers). To keep it shippable and reviewable, I'll deliver it in **five phases**, each ending in a working state. You approve this plan, then I ship phase 1 and pause for review before phase 2.

The existing pieces I'll build on (already live):
- Supabase auth + `_authenticated`-style admin gate at `/admin`
- `insight_articles` + `insight_categories` tables and admin editor
- `audit_logs` + `auth_attempts` + rate limiting
- `user_roles` with `admin` role and `private.has_role()`
- `insights-covers` private storage bucket
- Contact form → Resend

Everything below extends that foundation — nothing is thrown away.

---

## Phase 1 — Foundation (schema, storage, roles, shell)

**Database (single migration):**
- `app_role` enum: add `editor` alongside `admin`
- `profiles` (user_id FK auth.users, display_name, avatar_url, bio)
- `media_assets` (bucket, path, mime, size, width, height, alt, folder, uploader_id) — indexed by folder + created_at
- `media_folders` (name, parent_id)
- `tags` (slug, label_ar, label_en) + `article_tags`, `project_tags` join tables
- `services` (slug, title_ar/en, description_ar/en, features jsonb, icon, cover_media_id, cta_label/href, seo_*, featured, status, sort_order)
- `portfolio_projects` (slug, name_ar/en, client, industry, short_description_ar/en, challenge_ar/en, solution_ar/en, results_ar/en, cover_media_id, gallery jsonb, tags[], services_used uuid[], featured, status, seo_*)
- `pages` (slug, title_ar/en, hero jsonb, blocks jsonb, seo_*, status) — for Home / About / Services / Portfolio / Insights / Contact / Privacy
- `contact_messages` (name, email, phone, subject, message, status: unread/read/archived, ip, user_agent)
- `site_settings` (single-row keyed table: logo, favicon, company, email, phone, address, socials jsonb, analytics jsonb)
- `article_revisions` (article_id, snapshot jsonb, editor_id) — enables safe drafts + rollback
- Extend `insight_articles`: add `scheduled_at`, `gallery jsonb`, `related_article_ids uuid[]`

**RLS:** public SELECT only on published rows (`status='published'` + not scheduled in future). All writes: `authenticated` + `private.has_role(auth.uid(), 'admin' | 'editor')`. Every table gets proper `GRANT`s.

**Storage:** new private buckets `media-library`, `portfolio-covers`, `service-covers`, `site-branding` with admin-write + signed-URL proxy (same pattern as `insights-covers`).

**Realtime:** enabled on `contact_messages` for live inbox count.

**Admin shell:** replace current admin header with a Notion/Linear-style sidebar (`SidebarProvider`) — collapsible, active-route highlight, sections: Dashboard, Pages, Articles, Portfolio, Services, Categories, Tags, Media, Messages, SEO, Settings, Profile. Keyboard shortcut `⌘K` global search (registered, results wired in phase 2).

**Delivered at end of Phase 1:** every table live, RLS locked, admin sidebar rendered with routes stubbed. Existing Insights admin keeps working.

---

## Phase 2 — Content CMS (Articles v2, Portfolio, Services, Pages)

- **Articles v2:** upgrade current editor with scheduled publishing, gallery, related-article picker, tag chips, duplicate action, revisions dropdown, live word-count + reading time. Notion-like block editor via TipTap extensions (headings, paragraphs, images, tables, quotes, callouts, code, video embed, internal-link picker, external link).
- **Portfolio CMS:** list + editor with challenge/solution/results long-form fields, gallery uploader, services-used multiselect, featured toggle.
- **Services CMS:** list + editor with features repeater, icon picker (lucide), CTA fields.
- **Pages CMS:** each of Home/About/Services/Portfolio/Insights/Contact/Privacy becomes a `pages` row. Hero fields + a flexible `blocks` array (typed block schema: hero, stats, testimonials-ref, cta, richtext). Publish/draft per page.
- **Filters + search:** per-list filters (status, category, tags, date, author) + global `⌘K` search across articles/projects/services/pages/media (Postgres FTS on title/excerpt/content columns).

**Delivered:** content editable end-to-end in the admin, still consuming from old sources on the public site.

---

## Phase 3 — Live-site rewiring (biggest visible change)

Migrate every public route to read from Supabase via `createServerFn` (server-side, publishable client with narrow `TO anon` SELECT policies). Order:

1. Seed migration: import current hardcoded portfolio/services/testimonials/home content into new tables so nothing goes blank
2. `HomeView`, `ProjectsHubView`, `ProjectsCategoryView`, `ProjectDetailView` → DB
3. `PackagesView` (services), `AboutView`, `ContactView`, `InsightsHubView` (already DB) → DB via `pages` blocks
4. Contact form: `POST /api/public/contact` inserts into `contact_messages` **and** emails via Resend (both, so nothing is lost if email fails)
5. Sitemap + RSS: regenerate from DB, include portfolio and services URLs

Every public loader returns absolute-URL SEO metadata (canonical, og:image, hreflang, JSON-LD: Article/FAQ/Breadcrumb/Organization/Author) derived from row data.

**Delivered:** publishing in the admin updates the live site instantly. No hardcoded content remains.

---

## Phase 4 — Media Library, Messages, SEO Manager, Settings

- **Media Library:** grid/list view, drag-drop upload, folders, alt text, replace-in-place, search, usage indicator ("used in 3 articles"). Signed URLs via server function; picker embeddable in every editor.
- **Contact Messages:** inbox with unread badge (realtime), detail pane, reply-via-email link, archive/delete, filters.
- **SEO Manager:** cross-content view listing every published URL with SEO health (missing meta, duplicate titles, missing og:image), one-click fix opens the underlying row's editor. Sitemap + robots auto-regenerate from DB.
- **Website Settings:** single-form page for logo/favicon/company/contact/socials + analytics fields (GA4, GSC, GTM, Facebook Pixel) — injected into `<head>` from `__root.tsx` loader.
- **Profile:** display name, avatar, password change, sign-out-all-sessions.

**Delivered:** full operator toolkit.

---

## Phase 5 — AI helpers, permissions polish, performance

- **AI actions** (Lovable AI Gateway, server-side via `createServerFn`, model `google/gemini-3-flash-preview`): Generate SEO Title / Meta Description / Excerpt / FAQ / Rewrite / Continue Writing / Improve Readability. Buttons live inline in the article editor; each returns a diff preview before applying.
- **Roles:** `editor` role — can create/edit but not publish or manage users/settings. Route + RLS gates enforce it.
- **Performance:** cursor pagination on all lists (50/page), `react-window` for long tables, image `srcset` + AVIF/WebP, TanStack Query `staleTime` tuning, prefetch on hover, indexes on `(status, published_at)` per content table.
- **Dashboard home:** stat cards (totals + week deltas), recent activity feed from `audit_logs` + `article_revisions`, quick actions.

**Delivered:** production-ready CMS.

---

## Technical notes (details)

- **Editor:** TipTap 2 with StarterKit + Image + Table + Link + CodeBlockLowlight + Placeholder + custom Callout node. Content stored as ProseMirror JSON + rendered HTML column (for fast public reads without client JS).
- **Slugs:** DB trigger + client uniqueness check on blur (both languages).
- **Scheduled publishing:** public policy already gates on `published_at <= now()` — no cron needed. Add same pattern to portfolio/services/pages.
- **Revisions:** trigger on `insight_articles` UPDATE → insert into `article_revisions` (last 20 kept per article).
- **Storage:** admin uploads via `supabase.storage.from(bucket).upload()` with `service-role`-signed intent from a server function; public reads via short-TTL signed URLs cached by the loader.
- **Realtime:** `contact_messages` for the inbox badge only; other lists use `router.invalidate()` after mutations (cheaper).
- **i18n:** every content table has `_ar` and `_en` columns; loaders pick the pair based on route locale.
- **Security:** every write goes through a server function with `requireSupabaseAuth` + role check; audit-log every publish/delete/settings-change.

---

## What I'll ship if you approve

**Right now (Phase 1):**
1. Migration for all new tables + role enum + RLS + storage buckets + realtime
2. New admin sidebar shell with all 12 sections routed (stub screens where phase 2+ owns the content)
3. Profile page (real, since it's small and cross-cutting)
4. Existing Insights admin re-parented under the new sidebar unchanged

Then I pause and you review before phase 2 begins.

---

## One decision I need from you before Phase 3

The live-site rewiring in Phase 3 will overwrite the currently hardcoded portfolio project pages (the 100+ image PDF assets). I will seed them from the current data so nothing looks empty on day one. **Are you comfortable with that seed approach, or would you rather I hold Phase 3 until you've re-entered/curated each portfolio project through the new admin?** Reply here and I'll adjust — but you don't need to answer to start Phase 1.
