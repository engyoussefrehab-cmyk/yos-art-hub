/**
 * Command Palette — primary keyboard-first navigation.
 *
 * Aggregates:
 *   - navigation entries from module-registry
 *   - registered commands from command-registry
 *   - quick-create actions from every module
 *
 * Shortcut: ⌘K / Ctrl+K.
 */

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { AdminIcon } from "@/admin/shell/icon";
import { listModules } from "@/admin/lib/module-registry";
import { listCommands, type CommandGroup as CmdGroup } from "@/admin/lib/command-registry";

const GROUP_LABEL: Record<CmdGroup, string> = {
  navigate: "Navigate",
  create: "Create",
  search: "Search",
  actions: "Actions",
  settings: "Settings",
  help: "Help",
};

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  const grouped = useMemo(() => {
    const modules = listModules();
    const commands = listCommands();
    const groups: Record<CmdGroup, Array<{
      id: string;
      label: string;
      icon?: string;
      shortcut?: string;
      to?: string;
      run?: () => void | Promise<void>;
      keywords?: string[];
    }>> = {
      navigate: [],
      create: [],
      search: [],
      actions: [],
      settings: [],
      help: [],
    };

    // Modules -> Navigate
    for (const m of modules) {
      groups.navigate.push({
        id: `module.${m.key}`,
        label: `Go to ${m.label}`,
        icon: m.icon,
        to: m.route,
        keywords: [m.key, m.label, m.section],
      });
      for (const qa of m.quickActions ?? []) {
        groups.create.push({
          id: qa.id,
          label: qa.label,
          icon: qa.icon,
          to: qa.to,
          run: qa.run,
          keywords: [m.key, m.label],
        });
      }
    }

    for (const c of commands) {
      groups[c.group].push({
        id: c.id,
        label: c.label,
        icon: c.icon,
        shortcut: c.shortcut,
        to: c.to,
        run: c.run,
        keywords: c.keywords,
      });
    }
    return groups;
  }, [open]);

  const execute = (entry: { to?: string; run?: () => void | Promise<void> }) => {
    onOpenChange(false);
    setQuery("");
    if (entry.run) {
      Promise.resolve(entry.run()).catch((e) => console.error(e));
      return;
    }
    if (entry.to) navigate({ to: entry.to });
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Type a command or search…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        {(Object.keys(grouped) as CmdGroup[]).map((g, idx) => {
          const items = grouped[g];
          if (items.length === 0) return null;
          return (
            <div key={g}>
              {idx > 0 && <CommandSeparator />}
              <CommandGroup heading={GROUP_LABEL[g]}>
                {items.map((it) => (
                  <CommandItem
                    key={it.id}
                    value={`${it.label} ${(it.keywords ?? []).join(" ")}`}
                    onSelect={() => execute(it)}
                  >
                    <AdminIcon name={it.icon} className="mr-2 h-4 w-4" />
                    <span>{it.label}</span>
                    {it.shortcut && <CommandShortcut>{it.shortcut}</CommandShortcut>}
                  </CommandItem>
                ))}
              </CommandGroup>
            </div>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
}
