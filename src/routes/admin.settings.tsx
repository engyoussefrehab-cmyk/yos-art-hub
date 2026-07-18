import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { A, useAdminLang } from "@/i18n/admin-lang";

type Settings = {
  key: string;
  logo_url: string | null;
  favicon_url: string | null;
  company_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  socials: Record<string, string>;
  analytics: Record<string, string>;
};

const KEY = "default";

const empty: Settings = {
  key: KEY, logo_url: "", favicon_url: "", company_name: "", contact_email: "",
  contact_phone: "", address: "", socials: {}, analytics: {},
};

function SettingsPage() {
  const { dir, t } = useAdminLang();
  const [s, setS] = useState<Settings>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("site_settings").select("*").eq("key", KEY).maybeSingle();
      if (data) setS({ ...empty, ...(data as any), socials: (data as any).socials ?? {}, analytics: (data as any).analytics ?? {} });
      setLoading(false);
    })();
  }, []);

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS((x) => ({ ...x, [k]: v }));
  const setSoc = (k: string, v: string) => setS((x) => ({ ...x, socials: { ...x.socials, [k]: v } }));
  const setAn = (k: string, v: string) => setS((x) => ({ ...x, analytics: { ...x.analytics, [k]: v } }));

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("site_settings").upsert({ ...s, key: KEY }, { onConflict: "key" });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success(t(A.settings_saved));
  };

  if (loading) return <div className="text-sm text-muted-foreground">{t(A.loading)}</div>;

  return (
    <div dir={dir} className="max-w-3xl space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t(A.settings_title)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t(A.settings_subtitle)}</p>
        </div>
        <Button onClick={save} disabled={saving}>{saving ? t(A.saving) : t(A.save)}</Button>
      </div>

      <section className="space-y-4 rounded-2xl border border-border/70 bg-card p-6">
        <h2 className="font-semibold">{t(A.identity)}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2"><Label>{t(A.logo_url)}</Label><Input value={s.logo_url ?? ""} onChange={(e) => set("logo_url", e.target.value)} dir="ltr" /></div>
          <div className="grid gap-2"><Label>{t(A.favicon_url)}</Label><Input value={s.favicon_url ?? ""} onChange={(e) => set("favicon_url", e.target.value)} dir="ltr" /></div>
          <div className="grid gap-2"><Label>{t(A.company_name)}</Label><Input value={s.company_name ?? ""} onChange={(e) => set("company_name", e.target.value)} /></div>
          <div className="grid gap-2"><Label>{t(A.contact_email)}</Label><Input value={s.contact_email ?? ""} onChange={(e) => set("contact_email", e.target.value)} dir="ltr" /></div>
          <div className="grid gap-2"><Label>{t(A.contact_phone)}</Label><Input value={s.contact_phone ?? ""} onChange={(e) => set("contact_phone", e.target.value)} dir="ltr" /></div>
          <div className="grid gap-2 md:col-span-2"><Label>{t(A.address)}</Label><Textarea rows={2} value={s.address ?? ""} onChange={(e) => set("address", e.target.value)} /></div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border/70 bg-card p-6">
        <h2 className="font-semibold">{t(A.socials)}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {["instagram", "linkedin", "behance", "twitter", "facebook", "youtube", "whatsapp"].map((k) => (
            <div key={k} className="grid gap-2">
              <Label className="capitalize">{k}</Label>
              <Input value={s.socials[k] ?? ""} onChange={(e) => setSoc(k, e.target.value)} placeholder="https://…" dir="ltr" />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border/70 bg-card p-6">
        <h2 className="font-semibold">{t(A.analytics)}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2"><Label>Google Analytics ID</Label><Input value={s.analytics.ga4 ?? ""} onChange={(e) => setAn("ga4", e.target.value)} placeholder="G-XXXXXXX" dir="ltr" /></div>
          <div className="grid gap-2"><Label>Google Tag Manager</Label><Input value={s.analytics.gtm ?? ""} onChange={(e) => setAn("gtm", e.target.value)} placeholder="GTM-XXXXXX" dir="ltr" /></div>
          <div className="grid gap-2"><Label>Facebook Pixel</Label><Input value={s.analytics.fb_pixel ?? ""} onChange={(e) => setAn("fb_pixel", e.target.value)} dir="ltr" /></div>
          <div className="grid gap-2"><Label>Search Console Verification</Label><Input value={s.analytics.gsc ?? ""} onChange={(e) => setAn("gsc", e.target.value)} dir="ltr" /></div>
        </div>
      </section>
    </div>
  );
}

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});
