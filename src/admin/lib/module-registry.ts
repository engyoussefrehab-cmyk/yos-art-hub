/**
 * Module Registry — the plugin system for admin modules.
 *
 * A module is a self-contained folder under `src/admin/modules/<key>/`
 * that owns its routes, forms, tables, actions, permissions, settings,
 * and components. The core shell reads this registry; adding a module
 * never requires changing the shell.
 *
 *   registerModule({
 *     key: "projects",
 *     label: "Projects",
 *     route: "/admin/portfolio",
 *     icon: "briefcase",
 *     section: "content",
 *     order: 20,
 *     entityKey: "portfolio_project",   // links to entity-registry
 *     permissions: { view: ["admin", "editor", "author"] },
 *     featureFlag: "cms.new_admin_shell",
 *     quickActions: [...],
 *   });
 */

import type { ComponentType, LazyExoticComponent } from "react";

export type SidebarSection =
  | "content"
  | "commerce"
  | "design"
  | "taxonomy"
  | "operations"
  | "system"
  | "developer";

export interface ModuleQuickAction {
  /** Stable id — surfaced in command palette. */
  id: string;
  label: string;
  /** Optional keyboard shortcut hint, e.g. "N". */
  shortcut?: string;
  /** Where the action navigates (Link `to`). */
  to?: string;
  /** Or a callback invoked on execute. */
  run?: () => void | Promise<void>;
  /** Permission scopes required (falls back to the module's permissions). */
  requires?: string[];
  icon?: string;
}

export interface ModuleDefinition {
  /** Stable module id. Kebab-case. */
  key: string;
  label: string;
  description?: string;
  /** Sidebar route target (Link `to`). */
  route: string;
  /** Lucide icon name (resolved at render time to keep the registry serializable). */
  icon?: string;
  section: SidebarSection;
  order?: number;
  /** Related entity key from the entity registry, if this module lists a single entity. */
  entityKey?: string;
  /** Feature flag key — module is hidden unless the flag evaluates true. */
  featureFlag?: string;
  /** Role/permission scopes required to see the module in the sidebar. */
  permissions?: {
    view?: string[];
    create?: string[];
    update?: string[];
    delete?: string[];
  };
  /** Quick actions exposed to the command palette (New Project, New Article, ...). */
  quickActions?: ModuleQuickAction[];
  /** Optional root component override for /admin/<key>. When omitted, the module
   *  relies on its own file-based routes under src/routes/admin.*. */
  component?: LazyExoticComponent<ComponentType>;
  /** Badge shown next to the sidebar entry — computed at render time. */
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
