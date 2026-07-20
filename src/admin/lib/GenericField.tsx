/**
 * Generic form-field renderers for the entity registry.
 * Kept intentionally minimal — the goal is architectural validation, not UI
 * polish. Each field kind maps to a single component. Complex kinds (blocks,
 * media) fall through to a raw JSON textarea until a dedicated renderer is
 * registered.
 */

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
  const common = (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs font-medium">
        {field.label}
        {field.required ? <span className="text-destructive"> *</span> : null}
      </Label>
    </div>
  );

  switch (field.kind) {
    case "boolean":
      return (
        <div className="flex items-center justify-between rounded-md border px-3 py-2">
          <Label htmlFor={id} className="text-sm">
            {field.label}
          </Label>
          <Switch
            id={id}
            checked={Boolean(value)}
            onCheckedChange={(v) => onChange(v)}
          />
        </div>
      );
    case "textarea":
      return (
        <div className="flex flex-col gap-1.5">
          {common.props.children}
          <Textarea
            id={id}
            value={(value as string) ?? ""}
            rows={4}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
    case "number":
      return (
        <div className="flex flex-col gap-1.5">
          {common.props.children}
          <Input
            id={id}
            type="number"
            value={value === null || value === undefined ? "" : String(value)}
            onChange={(e) =>
              onChange(e.target.value === "" ? null : Number(e.target.value))
            }
          />
        </div>
      );
    case "select":
      return (
        <div className="flex flex-col gap-1.5">
          {common.props.children}
          <Select
            value={(value as string) ?? ""}
            onValueChange={(v) => onChange(v)}
          >
            <SelectTrigger id={id}>
              <SelectValue placeholder="Select…" />
            </SelectTrigger>
            <SelectContent>
              {(field.options ?? []).map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          {common.props.children}
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
                onChange(raw); // keep string until valid; parsed on save
              }
            }}
          />
          <span className="text-[10px] text-muted-foreground">
            JSON — parsed on save
          </span>
        </div>
      );
    case "date":
    case "slug":
    case "text":
    default:
      return (
        <div className="flex flex-col gap-1.5">
          {common.props.children}
          <Input
            id={id}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
  }
}
