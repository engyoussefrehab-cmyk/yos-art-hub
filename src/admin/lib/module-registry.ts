/**
 * Module Registry — the plugin system for admin modules.
 *
 * `label` and quick-action `label`s accept either a plain string or an
 * `L = {ar,en}` pair. Consumers resolve with `resolveL(...)` from
 * `@/i18n/admin-lang`; every registered module is automatically bilingual.
 */

import type { ComponentType, LazyExoticComponent } from "react";
import type { LocalizedLabel } from "./entity-registry";

export type SidebarSection =
  | "content"
  | "commerce"
  | "design"
  | "taxonomy"
  | "operations"
  | "system"
  | "developer";

export interface ModuleQuickAction {
  id: string;
  label: LocalizedLabel;
  shortcut?: string;
  to?: string;
  run?: () => void | Promise<void>;
  requires?: string[];
  icon?: string;
}

export interface ModuleDefinition {
  key: string;
  label: LocalizedLabel;
  description?: LocalizedLabel;
  route: string;
  icon?: string;
  section: SidebarSection;
  order?: number;
  entityKey?: string;
  featureFlag?: string;
  permissions?: {
    view?: string[];
    create?: string[];
    update?: string[];
    delete?: string[];
  };
  quickActions?: ModuleQuickAction[];
  component?: LazyExoticComponent<ComponentType>;
  badge?: () => Promise<string | number | null> | string | number | null;
}

const modules = new Map<string, ModuleDefinition>();

export function registerModule(def: ModuleDefinition): void {
  if (modules.has(def.key) && import.meta.env?.DEV) {
    console.warn(`[module-registry] Overwriting module "${def.key}"`);
  }
  modules.set(def.key, def);
}

export function getModule(key: string): ModuleDefinition | undefined {
  return modules.get(key);
}

export function listModules(): ModuleDefinition[] {
  return Array.from(modules.values()).sort(
    (a, b) => (a.order ?? 100) - (b.order ?? 100),
  );
}

export function listModulesBySection(): Record<SidebarSection, ModuleDefinition[]> {
  const out: Record<SidebarSection, ModuleDefinition[]> = {
    content: [],
    commerce: [],
    design: [],
    taxonomy: [],
    operations: [],
    system: [],
    developer: [],
  };
  for (const m of listModules()) out[m.section].push(m);
  return out;
}
