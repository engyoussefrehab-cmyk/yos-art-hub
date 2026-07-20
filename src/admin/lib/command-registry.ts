/**
 * Command Registry — powers the ⌘K command palette. Labels accept
 * bilingual `L = {ar,en}` pairs or plain strings.
 */

import type { LocalizedLabel } from "./entity-registry";

export type CommandGroup =
  | "navigate"
  | "create"
  | "search"
  | "actions"
  | "settings"
  | "help";

export interface CommandEntry {
  id: string;
  label: LocalizedLabel;
  hint?: LocalizedLabel;
  keywords?: string[];
  group: CommandGroup;
  icon?: string;
  shortcut?: string;
  to?: string;
  run?: () => void | Promise<void>;
  requires?: string[];
  featureFlag?: string;
}

const commands = new Map<string, CommandEntry>();

export function registerCommand(cmd: CommandEntry): void {
  commands.set(cmd.id, cmd);
}

export function listCommands(): CommandEntry[] {
  return Array.from(commands.values());
}

export function unregisterCommand(id: string) {
  commands.delete(id);
}
