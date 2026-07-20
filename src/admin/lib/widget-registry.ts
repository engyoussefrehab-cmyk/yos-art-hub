/**
 * Dashboard Widget Registry.
 *
 * Any module can register its own dashboard widgets — Recent Projects,
 * Pending Reviews, Leads, Analytics, Storage, Forms, Activity, Site
 * Health. Widgets are ordered per-user and stored in `cms_settings_values`
 * under group `dashboard`, key `layout.<userId>`; the shell falls back to
 * the widget's `defaultOrder` when the user has no saved layout.
 */

import type { ComponentType, LazyExoticComponent } from "react";

export type WidgetSize = "sm" | "md" | "lg" | "xl";

export interface WidgetDefinition {
  /** Stable id, module-prefixed (e.g. "projects.recent"). */
  id: string;
  label: string;
  description?: string;
  size: WidgetSize;
  defaultOrder?: number;
  /** Owning module key — surfaced for filtering/toggling. */
  moduleKey?: string;
  /** Permission scopes required. */
  requires?: string[];
  featureFlag?: string;
  /** Lazy component. */
  component: LazyExoticComponent<ComponentType<{ widgetId: string }>>;
}

const widgets = new Map<string, WidgetDefinition>();

export function registerWidget(def: WidgetDefinition): void {
  if (widgets.has(def.id) && import.meta.env?.DEV) {
    console.warn(`[widget-registry] Overwriting widget "${def.id}"`);
  }
  widgets.set(def.id, def);
}

export function listWidgets(): WidgetDefinition[] {
  return Array.from(widgets.values()).sort(
    (a, b) => (a.defaultOrder ?? 100) - (b.defaultOrder ?? 100),
  );
}

export function getWidget(id: string) {
  return widgets.get(id);
}
