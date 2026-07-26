/**
 * Entity Registry — single source of truth for every CMS-managed entity.
 *
 * Adding a new module = calling `registerEntity({...})`. The admin shell reads
 * this registry to auto-generate list views, forms, revisions, dependency
 * scanners, and workflow controls. No new CRUD code should be required for
 * standard entities.
 *
 * All human-facing labels accept either a plain string (mono-lingual, English)
 * or an `L = {ar, en}` pair. Consumers resolve with `resolveL(label, lang)`
 * from `@/i18n/admin-lang`, so every registered entity is automatically
 * bilingual — no extra work is required in the module code.
 */

import type { L } from "@/i18n/admin-lang";

export type LocalizedLabel = string | L;

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
  | "gallery"

  | "relation"
  | "blocks"
  | "json";

export interface EntityField {
  key: string;
  label: LocalizedLabel;
  kind: EntityFieldKind;
  required?: boolean;
  localized?: boolean;
  options?: Array<{ value: string; label: LocalizedLabel }>;
  /**
   * Dynamic option source for `select` fields — options are loaded live from a
   * table instead of being hardcoded (e.g. project categories).
   */
  optionsSource?: {
    table: string;
    valueColumn: string;
    labelArColumn?: string;
    labelEnColumn?: string;
    orderBy?: string;
  };
  relationTo?: string;
  helpText?: LocalizedLabel;
  /** Path used by media/dependency scanners (e.g. "blocks[].image"). */
  scanPath?: string;
}

export interface EntityListColumn {
  key: string;
  label: LocalizedLabel;
  sortable?: boolean;
  width?: string;
  render?: "text" | "badge" | "date" | "image" | "workflow";
}

export interface EntityDefinition {
  key: string;
  label: LocalizedLabel;
  labelPlural: LocalizedLabel;
  table: string;
  pkColumn?: string;
  slugColumn?: string | null;
  hasI18n?: boolean;
  supportsWorkflow?: boolean;
  supportsVersioning?: boolean;
  deletable?: boolean;
  previewPathTemplate?: string | null;
  icon?: string;
  section?: "content" | "commerce" | "system" | "developer";
  routeSlug?: string;
  fields: EntityField[];
  listColumns: EntityListColumn[];
  permissions?: {
    view?: string[];
    create?: string[];
    update?: string[];
    delete?: string[];
    publish?: string[];
  };
  scanners?: string[];
  featureFlag?: string;
}

const registry = new Map<string, EntityDefinition>();

export function registerEntity(def: EntityDefinition): void {
  if (registry.has(def.key)) {
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
