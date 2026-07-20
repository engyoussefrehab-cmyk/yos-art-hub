# Admin Core Registries

This directory is the plugin surface of the CMS. Everything here is
API-first, meaning: server code, admin UI, and future clients (mobile,
client portal, external integrations) all consume the same registries.

## Files

- **entity-registry.ts** — register a new content module. Drives list
  views, forms, revisions, dependency scanners, workflow controls.
- **block-registry.ts** — register a new editor block. Editors and public
  renderers pick blocks up automatically.
- **settings-registry.ts** — register a new settings page. Values persist
  in `cms_settings_values`; UI is generated from the field schema.
- **feature-flags.ts** — read `cms_feature_flags` and gate any feature by
  key, role, user, or rollout percent.
- **events.ts** — subscribe to CMS events (published, updated, deleted,
  workflow changed, lead created, form submitted, media deleted).

## Adding a new module — checklist

1. `registerEntity({...})` in `src/admin/entities/<key>.ts`.
2. (Optional) `registerSettings({...})` for module-specific settings.
3. (Optional) `registerBlock({...})` for module-specific editor blocks.
4. Add a feature flag row so the module can ship dark and light up per env.
5. Subscribe to whatever events you need in the admin UI.

No CRUD code is required for standard entities — the generic CRUD server
functions in `src/admin/lib/cms.functions.ts` cover create/read/update/
soft-delete/publish/versioning/audit against any registered entity.
