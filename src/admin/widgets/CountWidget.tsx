/**
 * Generic count widget — reads a single row count from any table.
 */
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { AdminIcon } from "@/admin/shell/icon";

export interface CountWidgetProps {
  table: string;
  label: string;
  icon?: string;
  to?: string;
  hint?: string;
  filter?: { column: string; value: string };
}

export function CountWidget({ table, label, icon, to, hint, filter }: CountWidgetProps) {
  const [value, setValue] = useState<number | null>(null);
  useEffect(() => {
    let q = supabase.from(table as never).select("id", { count: "exact", head: true });
    if (filter) q = q.eq(filter.column, filter.value);
    q.then(({ count }) => setValue(count ?? 0));
  }, [table, filter?.column, filter?.value]);

  const inner = (
    <Card className="group h-full transition-colors hover:border-primary/50">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <AdminIcon name={icon} className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4 text-3xl font-semibold tracking-tight">
          {value ?? "—"}
        </div>
        <div className="mt-1 text-sm text-muted-foreground">{label}</div>
        {hint && <div className="mt-2 text-[11px] text-muted-foreground/80">{hint}</div>}
      </CardContent>
    </Card>
  );

  return to ? <Link to={to} className="block h-full">{inner}</Link> : inner;
}
