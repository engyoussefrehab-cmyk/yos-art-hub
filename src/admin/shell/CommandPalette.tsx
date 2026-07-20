/**
 * Command Palette — primary keyboard-first navigation.
 *
 * Aggregates navigation entries from module-registry, registered commands
 * from command-registry, and quick-create actions from every module. All
 * labels resolve through the admin i18n dictionary.
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
import { A, useAdminLang, type L } from "@/i18n/admin-lang";
import type { LocalizedLabel } from "@/admin/lib/entity-registry";

const GROUP_LABEL: Record<CmdGroup, L> = {
  navigate: A.cmd_group_navigate,
  create: A.cmd_group_create,
  search: A.cmd_group_search,
  actions: A.cmd_group_actions,
  settings: A.cmd_group_settings,
  help: A.cmd_group_help,
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
  const { t } = useAdminLang();

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
      label: LocalizedLabel;
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

    const goTo = t(A.go_to);
    for (const m of modules) {
      const moduleLabel = t(m.label);
      groups.navigate.push({
        id: `module.${m.key}`,
        label: `${goTo} ${moduleLabel}`,
        icon: m.icon,
        to: m.route,
        keywords: [m.key, moduleLabel, m.section],
      });
      for (const qa of m.quickActions ?? []) {
        groups.create.push({
          id: qa.id,
          label: qa.label,
          icon: qa.icon,
          to: qa.to,
          run: qa.run,
          keywords: [m.key, moduleLabel],
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
    // Regenerate when the palette re-opens or language switches.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, t]);

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
        placeholder={t(A.cmd_placeholder)}
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>{t(A.cmd_empty)}</CommandEmpty>
        {(Object.keys(grouped) as CmdGroup[]).map((g, idx) => {
          const items = grouped[g];
          if (items.length === 0) return null;
          return (
            <div key={g}>
              {idx > 0 && <CommandSeparator />}
              <CommandGroup heading={t(GROUP_LABEL[g])}>
                {items.map((it) => {
                  const label = t(it.label);
                  return (
                    <CommandItem
                      key={it.id}
                      value={`${label} ${(it.keywords ?? []).join(" ")}`}
                      onSelect={() => execute(it)}
                    >
                      <AdminIcon name={it.icon} className="me-2 h-4 w-4" />
                      <span>{label}</span>
                      {it.shortcut && <CommandShortcut>{it.shortcut}</CommandShortcut>}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </div>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
}
