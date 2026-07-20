# Admin Modules

Each module is a self-contained folder registered via `registerModule({...})`
in `register-all.ts`. Modules own their routes, forms, tables, actions,
permissions, and settings — the shell reads the registry, never the module
internals.

## Adding a new module

1. Create `src/admin/modules/<key>/index.ts` (self-registers on import).
2. Optionally `entities/<key>.ts` (entity registry entry).
3. Optionally `widgets/<Name>.tsx` (dashboard widgets).
4. Optionally `settings.ts` (settings registry group).
5. Add the import to `register-all.ts`.
6. Add a feature flag row (`cms_feature_flags.key = "cms.<module>"`) so the
   module ships dark and lights up per environment.

No shell edits needed. The sidebar, command palette, dashboard, and
permission system pick up the new module automatically.

## Public site isolation

Admin modules MUST NOT import from `src/views/`, `src/components/` (except
the shared shadcn primitives under `src/components/ui/`), or public route
files. If shared UI is required, extract it into `src/components/ui/` or
a new shared package. Legacy admin routes under `src/routes/admin.*` are
scheduled for migration into `src/admin/modules/<key>/`.
