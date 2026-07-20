/**
 * Command Registry — powers the ⌘K command palette.
 *
 * Any module can register commands (navigation, create actions, quick
 * settings, integrations). The palette is the primary keyboard-first
 * navigation surface.
 */

export type CommandGroup =
  | "navigate"
  | "create"
  | "search"
  | "actions"
  | "settings"
  | "help";

export interface CommandEntry {
  id: string;
  label: string;
  hint?: string;
  keywords?: string[];
  group: CommandGroup;
  icon?: string;
  shortcut?: string;
  /** Either navigate to a route... */
  to?: string;
  /** ...or run a callback. */
  run?: () => void | Promise<void>;
  /** Permission scopes required. */
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
