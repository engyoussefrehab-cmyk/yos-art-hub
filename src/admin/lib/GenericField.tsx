/**
 * Generic form-field renderers for the entity registry.
 * Every visible label / helper is resolved through the admin i18n dictionary.
 */

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EntityField } from "@/admin/lib/entity-registry";
import { A, useAdminLang } from "@/i18n/admin-lang";

interface Props {
  field: EntityField;
  value: unknown;
  onChange: (next: unknown) => void;
}

function jsonString(v: unknown) {
  try {
    return typeof v === "string" ? v : JSON.stringify(v ?? null, null, 2);
  } catch {
    return "";
  }
}

export function GenericField({ field, value, onChange }: Props) {
  const id = `f-${field.key}`;
  const { t, lang } = useAdminLang();
  const label = t(field.label);
  const help = field.helpText ? t(field.helpText) : null;

  const [remoteOptions, setRemoteOptions] = useState<Array<{ value: string; label: string }>>([]);
  const src = field.optionsSource;
  useEffect(() => {
    if (!src) return;
    let cancelled = false;
    (async () => {
      const cols = [src.valueColumn, src.labelArColumn, src.labelEnColumn].filter(Boolean).join(",");
      let q = supabase.from(src.table as any).select(cols);
      if (src.orderBy) q = q.order(src.orderBy, { ascending: true });
      const { data } = await q;
      if (cancelled || !data) return;
      setRemoteOptions(
        (data as any[])
          .map((r) => ({
            value: String(r[src.valueColumn] ?? ""),
            label:
              String(
                (lang === "ar" ? r[src.labelArColumn ?? ""] : r[src.labelEnColumn ?? ""]) ??
                  r[src.labelArColumn ?? ""] ??
                  r[src.labelEnColumn ?? ""] ??
                  r[src.valueColumn],
              ),
          }))
          .filter((o) => o.value),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [src?.table, src?.valueColumn, src?.labelArColumn, src?.labelEnColumn, src?.orderBy, lang]);

  const selectOptions = src
    ? remoteOptions
    : (field.options ?? []).map((o) => ({ value: o.value, label: t(o.label) }));

  const LabelBlock = (
    <Label htmlFor={id} className="text-xs font-medium">
      {label}
      {field.required ? <span className="text-destructive"> *</span> : null}
    </Label>
  );

  switch (field.kind) {
    case "boolean":
      return (
        <div className="flex items-center justify-between rounded-md border px-3 py-2">
          <Label htmlFor={id} className="text-sm">{label}</Label>
          <Switch id={id} checked={Boolean(value)} onCheckedChange={(v) => onChange(v)} />
        </div>
      );
    case "textarea":
      return (
        <div className="flex flex-col gap-1.5">
          {LabelBlock}
          <Textarea
            id={id}
            value={(value as string) ?? ""}
            rows={4}
            onChange={(e) => onChange(e.target.value)}
          />
          {help && <span className="text-[10px] text-muted-foreground">{help}</span>}
        </div>
      );
    case "number":
      return (
        <div className="flex flex-col gap-1.5">
          {LabelBlock}
          <Input
            id={id}
            type="number"
            value={value === null || value === undefined ? "" : String(value)}
            onChange={(e) =>
              onChange(e.target.value === "" ? null : Number(e.target.value))
            }
          />
          {help && <span className="text-[10px] text-muted-foreground">{help}</span>}
        </div>
      );
    case "select":
      return (
        <div className="flex flex-col gap-1.5">
          {LabelBlock}
          <Select value={(value as string) ?? ""} onValueChange={(v) => onChange(v)}>
            <SelectTrigger id={id}>
              <SelectValue placeholder={t(A.select_placeholder)} />
            </SelectTrigger>
            <SelectContent>
              {(field.options ?? []).map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {t(o.label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {help && <span className="text-[10px] text-muted-foreground">{help}</span>}
        </div>
      );
    case "json":
    case "blocks":
    case "multiselect":
    case "media":
    case "relation":
    case "richtext":
      return (
        <div className="flex flex-col gap-1.5">
          {LabelBlock}
          <Textarea
            id={id}
            className="font-mono text-xs"
            rows={6}
            value={jsonString(value)}
            onChange={(e) => {
              const raw = e.target.value;
              try {
                onChange(JSON.parse(raw));
              } catch {
                onChange(raw);
              }
            }}
          />
          <span className="text-[10px] text-muted-foreground">
            {help ?? t(A.json_hint)}
          </span>
        </div>
      );
    case "date":
    case "slug":
    case "text":
    default:
      return (
        <div className="flex flex-col gap-1.5">
          {LabelBlock}
          <Input
            id={id}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
          {help && <span className="text-[10px] text-muted-foreground">{help}</span>}
        </div>
      );
  }
}
