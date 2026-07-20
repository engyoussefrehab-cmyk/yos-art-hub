/**
 * Entity Registry — single source of truth for every CMS-managed entity.
 *
 * Adding a new module = calling `registerEntity({...})`. The admin shell reads
 * this registry to auto-generate list views, forms, revisions, dependency
 * scanners, and workflow controls. No new CRUD code should be required for
 * standard entities.
 *
 * The registry is intentionally isomorphic (safe on client + server); every
 * consumer decides which fields it needs.
 */

export type WorkflowState =
  | "draft"
  | "in_review"
  | "approved"
  | "published"
  | "archived";

export type EntityFieldKind =
  | "text"
  | "textarea"
  | "richtext"
  | "slug"
  | "number"
  | "boolean"
  | "date"
  | "select"
  | "multiselect"
  | "media"
  | "relation"
  | "blocks"
  | "json";

export interface EntityField {
  key: string;
  label: string;
  kind: EntityFieldKind;
  required?: boolean;
  localized?: boolean;
  options?: Array<{ value: string; label: string }>;
  relationTo?: string;
  helpText?: string;
  /** Path used by media/dependency scanners (e.g. "blocks[].image"). */
  scanPath?: string;
}

export interface EntityListColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: "text" | "badge" | "date" | "image" | "workflow";
}

export interface EntityDefinition {
  /** Stable key — MUST match `cms_entity_types.key`. */
  key: string;
  label: string;
  labelPlural: string;
  /** Physical table name in the `public` schema. */
  table: string;
  pkColumn?: string;
  slugColumn?: string | null;
  hasI18n?: boolean;
  supportsWorkflow?: boolean;
  supportsVersioning?: boolean;
  deletable?: boolean;
  /** Template for public preview URL, e.g. "/projects/{category_slug}/{slug}". */
  previewPathTemplate?: string | null;
  icon?: string;
  /** Sidebar section this entity should appear under. */
  section?: "content" | "commerce" | "system" | "developer";
  /** Route path under /admin (defaults to `/admin/{labelPlural}` lowercased). */
  routeSlug?: string;
  fields: EntityField[];
  listColumns: EntityListColumn[];
  /** Permission scopes required. Falls back to entity key. */
  permissions?: {
    view?: string[];
    create?: string[];
    update?: string[];
    delete?: string[];
    publish?: string[];
  };
  /** Extra dependency scanners run on save (media, relations, custom). */
  scanners?: string[];
  /** Feature flag key that must be enabled for this entity to appear. */
  featureFlag?: string;
}

const registry = new Map<string, EntityDefinition>();

export function registerEntity(def: EntityDefinition): void {
  if (registry.has(def.key)) {
    // Re-registering is allowed for HMR; last write wins with a warning in dev.
    if (import.meta.env?.DEV) {
      console.warn(`[entity-registry] Overwriting entity "${def.key}"`);
    }
  }
  registry.set(def.key, Object.freeze(def));
}

export function getEntity(key: string): EntityDefinition | undefined {
  return registry.get(key);
}

export function listEntities(): EntityDefinition[] {
  return Array.from(registry.values());
}

export function listEntitiesBySection(section: EntityDefinition["section"]) {
  return listEntities().filter((e) => e.section === section);
}
