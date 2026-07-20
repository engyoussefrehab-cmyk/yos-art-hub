/**
 * Permissions — entity × action × field-level.
 *
 * The database is the authority (RLS + `has_role` + `cms_permissions`).
 * This module is the client-side mirror used to hide UI, disable inputs,
 * and short-circuit calls that would fail server-side anyway.
 *
 * Design:
 *   - Roles are string keys; adding a new role is a `cms_permissions` row,
 *     not a schema change.
 *   - Scopes look like "<entity>:<action>" (e.g. "portfolio_project:publish")
 *     or "field:<entity>.<field>:<action>" for field-level rules.
 *   - Wildcards: "*" matches any entity or any action.
 */

export type PermissionAction =
  | "view"
  | "create"
  | "update"
  | "delete"
  | "publish"
  | "archive"
  | "restore"
  | "duplicate";

export interface PermissionRow {
  role: string;
  scope: string; // "<entity>:<action>" or "field:<entity>.<field>:<action>" or "*"
  effect: "allow" | "deny";
}

export interface PermissionContext {
  roles: string[];
  userId?: string | null;
}

let rules: PermissionRow[] = [];

/** Replace the in-memory rule set (called after fetching cms_permissions). */
export function setPermissions(rows: PermissionRow[]): void {
  rules = rows;
}

/** Register additional rules (e.g. module-defined defaults at boot). */
export function addPermissions(rows: PermissionRow[]): void {
  rules = rules.concat(rows);
}

function matchScope(pattern: string, target: string): boolean {
  if (pattern === "*" || pattern === target) return true;
  const [pe, pa] = pattern.split(":");
  const [te, ta] = target.split(":");
  return (pe === "*" || pe === te) && (pa === "*" || pa === ta);
}

export function can(
  ctx: PermissionContext,
  entity: string,
  action: PermissionAction,
): boolean {
  const target = `${entity}:${action}`;
  const applicable = rules.filter((r) => ctx.roles.includes(r.role));
  // Explicit deny wins
  if (applicable.some((r) => r.effect === "deny" && matchScope(r.scope, target))) {
    return false;
  }
  return applicable.some((r) => r.effect === "allow" && matchScope(r.scope, target));
}

export function canField(
  ctx: PermissionContext,
  entity: string,
  field: string,
  action: PermissionAction,
): boolean {
  const target = `field:${entity}.${field}:${action}`;
  const applicable = rules.filter((r) => ctx.roles.includes(r.role));
  if (applicable.some((r) => r.effect === "deny" && matchScope(r.scope, target))) {
    return false;
  }
  // Field rule allows > fallback to entity-level
  if (applicable.some((r) => r.effect === "allow" && matchScope(r.scope, target))) {
    return true;
  }
  return can(ctx, entity, action);
}

/**
 * Default rules seeded at boot — matches the DB `has_role` conventions.
 * Admins can do everything; editors/authors/reviewers get scoped access.
 * These are overwritten by rows fetched from `cms_permissions`.
 */
export const DEFAULT_RULES: PermissionRow[] = [
  { role: "admin", scope: "*", effect: "allow" },
  { role: "editor", scope: "*:view", effect: "allow" },
  { role: "editor", scope: "*:create", effect: "allow" },
  { role: "editor", scope: "*:update", effect: "allow" },
  { role: "editor", scope: "*:publish", effect: "allow" },
  { role: "editor", scope: "*:duplicate", effect: "allow" },
  { role: "editor", scope: "*:archive", effect: "allow" },
  { role: "author", scope: "*:view", effect: "allow" },
  { role: "author", scope: "*:create", effect: "allow" },
  { role: "author", scope: "*:update", effect: "allow" },
  { role: "author", scope: "*:duplicate", effect: "allow" },
  { role: "reviewer", scope: "*:view", effect: "allow" },
];
