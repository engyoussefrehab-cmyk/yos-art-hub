# CMS Architecture

Living document — updated at the end of every phase. Public site is not
touched by CMS work.

## Design tenets

1. **Registry-driven.** Entities, blocks, and settings are declarations,
   not hand-written pages. Adding a module = registering it.
2. **API-first.** Every module exposes reusable server functions. A future
   client portal, mobile app, or external integration consumes the same
   surface — no business logic reimplemented in the UI layer.
3. **Universal primitives.** Versioning, autosave, audit, workflow states,
   soft-delete, dependencies, and events are shared across every entity.
4. **Zero hardcoded content.** Homepage, navigation, category layouts,
   design tokens, and blocks are all DB-driven.
5. **Server-validated.** RLS is a floor, not a ceiling. Every mutation
   flows through `createServerFn` with an explicit role check plus audit.
6. **Feature-flagged rollouts.** Every in-progress module ships behind a
   `cms.*` flag; production is safe by default.
7. **Performance from day one.** Lazy blocks, paginated queries,
   virtualization for lists >100 rows, cached feature flags & settings.

## Layered surface

```
┌──────────────────────────────────────────────────────────────┐
│  Admin UI (src/admin/**)                                     │
│    reads registries → renders list/form/inspector/settings   │
├──────────────────────────────────────────────────────────────┤
│  Registries (src/admin/lib/*)                                │
│    entity | block | settings | feature-flags | events        │
├──────────────────────────────────────────────────────────────┤
│  Server functions (createServerFn, RLS-scoped)               │
│    generic CRUD | revisions | workflow | media | audit       │
├──────────────────────────────────────────────────────────────┤
│  Postgres (Supabase)                                         │
│    cms_* primitives + entity tables + triggers → cms_events  │
└──────────────────────────────────────────────────────────────┘
```

## Universal primitives (database)

| Table                        | Purpose                                       |
|------------------------------|-----------------------------------------------|
| `cms_entity_types`           | Registry mirror — every managed entity        |
| `cms_revisions`              | Universal version history                     |
| `cms_autosaves`              | Transient per-user drafts                     |
| `cms_audit_log`              | Every destructive/privileged action           |
| `cms_permissions`            | Role × entity × action matrix                 |
| `cms_locks`                  | Optimistic edit locks                         |
| `cms_workflow_transitions`   | Role → allowed workflow transitions           |
| `cms_reusable_blocks`        | Save-as-reusable block library                |
| `cms_global_components`      | Site-wide components (CTA, footer, etc.)      |
| `cms_design_tokens`          | Colors, typography, spacing → CSS vars        |
| `cms_theme_presets`          | Named token bundles                           |
| `cms_category_templates`     | Per-category default content                  |
| `cms_category_layouts`       | Per-category page structure                   |
| `cms_forms` / `cms_form_*`   | Form builder + submissions                    |
| `crm_leads`                  | Sales pipeline                                |
| `media_folders` + `cms_media_usages` | Media tree + where-used index         |
| `cms_dependencies`           | Cross-entity edge index                       |
| `cms_navigations` / `_items` | Header/footer/mobile/sidebar/mega nav         |
| `cms_nav_suggestions`        | Auto-suggested nav items on create            |
| `cms_backups`                | Manual + scheduled DB backups                 |
| `cms_settings_groups`/`_values` | Universal settings registry                |
| `cms_feature_flags`          | Feature flag store                            |
| `cms_events`                 | Durable event log (workflow, lead, form...)   |

## Feature flags

Rows in `cms_feature_flags` are readable by any signed-in user (so the app
can gate features) and writable only by admins. Evaluation combines
`enabled`, `enabled_roles`, `enabled_user_ids`, and `rollout_percent`
(deterministic hash-bucket by user id).

Seeded flags: `cms.new_admin_shell`, `cms.homepage_builder`,
`cms.navigation_builder`, `cms.forms_builder`, `cms.leads_crm`,
`cms.ai_assist`, `cms.theme_presets`, `cms.dependency_checker`,
`cms.media_usage_tracking`, `cms.workflow_states`.

## Event system

Database triggers emit into `cms_events` for every important write:

- `portfolio_project.{created|updated|workflow_changed|published}`
- `insight_article.{...}`
- `service.{...}`
- `page.{...}`
- `lead.created`
- `form.submitted`
- `media.deleted`

Admin UI listens via `src/admin/lib/events.ts` for in-session reactions
(toasts, dependency refresh). Automations and integrations poll or stream
`cms_events` server-side.

## Security posture

- RLS enabled on every `public` table with explicit `TO authenticated`
  and `TO anon` grants scoped by policy.
- `has_role` / `cms_is_admin` / `cms_can_manage` are `SECURITY DEFINER`
  and `EXECUTE` is granted only to `authenticated` + `service_role`.
- Trigger helpers (`cms_write_revision`, `cms_emit_*`, etc.) have
  `EXECUTE` revoked from `PUBLIC` and `anon`; they run inside triggers
  only.
- Every destructive admin action is server-function-validated, checked
  against `has_role`, and audited into `cms_audit_log`.
- Delete flows go through the Dependency Checker first; Force-delete is
  admin-only and audited.

## Performance

- Feature flags cached in memory per session, invalidated on write.
- List views paginate at 25 by default; virtualized above 200 rows.
- Blocks are lazy-loaded (`React.lazy`) — the editor bundle stays small
  regardless of block count.
- Server functions return DTOs projected to safe columns only.
- Public site reads use narrow `TO anon` SELECT policies + server
  publishable client for SSR; user-scoped reads use `requireSupabaseAuth`.

## Phase status

- **Phase 0** (in progress): foundation migration ✅, architectural
  primitives (settings/flags/events) ✅, admin shell scaffolding (next).
- **Phase 1**: module-by-module migration.
- **Phase 2**: polish (scheduled publish, side-by-side diff UI, i18n
  workflow, import/export, webhook retry).
