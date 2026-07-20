/**
 * Recent Activity widget — reads latest rows from cms_events. Bilingual title.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { arSA, enUS } from "date-fns/locale";
import { A, useAdminLang } from "@/i18n/admin-lang";

interface EventRow {
  id: string;
  event_type: string;
  entity_type: string | null;
  created_at: string;
}

export default function RecentActivityWidget() {
  const [rows, setRows] = useState<EventRow[]>([]);
  const { t, lang } = useAdminLang();
  useEffect(() => {
    supabase
      .from("cms_events" as never)
      .select("id,event_type,entity_type,created_at")
      .order("created_at", { ascending: false })
      .limit(8)
      .then(({ data }) => setRows((data ?? []) as EventRow[]));
  }, []);
  const locale = lang === "ar" ? arSA : enUS;
  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle className="text-sm font-medium">{t(A.recent_activity)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {rows.length === 0 && (
          <div className="text-muted-foreground text-xs">{t(A.no_activity_yet)}</div>
        )}
        {rows.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-3">
            <div className="truncate">
              <span className="font-mono text-[11px] text-muted-foreground">
                {r.event_type}
              </span>
              {r.entity_type && (
                <span className="ms-2 text-xs text-muted-foreground">
                  · {r.entity_type}
                </span>
              )}
            </div>
            <div className="text-[11px] text-muted-foreground shrink-0">
              {formatDistanceToNow(new Date(r.created_at), { addSuffix: true, locale })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
