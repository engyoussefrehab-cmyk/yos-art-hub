/**
 * Settings Registry — every settings page plugs in here.
 *
 * Groups mirror `cms_settings_groups`; values live in `cms_settings_values`
 * (`group_key`, `key`, `value` JSONB). Any future module can call
 * `registerSettings({...})` at boot to expose its own settings screen in
 * /admin/settings without a code change to the shell.
 */

export type SettingFieldKind =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "select"
  | "media"
  | "color"
  | "json"
  | "secret";

export interface SettingField {
  key: string;
  label: string;
  kind: SettingFieldKind;
  helpText?: string;
  required?: boolean;
  default?: unknown;
  options?: Array<{ value: string; label: string }>;
  /** Only admins can read/write. Values with `secret: true` route through the
   * server-only settings function and never appear in the browser client. */
  secret?: boolean;
}

export interface SettingsGroup {
  /** MUST match `cms_settings_groups.key`. */
  key: string;
  label: string;
  description?: string;
  icon?: string;
  category?: "core" | "integrations" | "developer" | "module";
  sortOrder?: number;
  fields: SettingField[];
  featureFlag?: string;
}

const groups = new Map<string, SettingsGroup>();

export function registerSettings(group: SettingsGroup): void {
  if (groups.has(group.key) && import.meta.env?.DEV) {
    console.warn(`[settings-registry] Overwriting group "${group.key}"`);
  }
  groups.set(group.key, group);
}

export function getSettingsGroup(key: string) {
  return groups.get(key);
}

export function listSettingsGroups() {
  return Array.from(groups.values()).sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );
}
