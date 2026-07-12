import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Trash2, Copy, Image as ImageIcon, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";

type Asset = {
  id: string;
  bucket: string;
  path: string;
  mime: string | null;
  size: number | null;
  width: number | null;
  height: number | null;
  alt_ar: string | null;
  alt_en: string | null;
  created_at: string;
  signedUrl?: string;
};

const BUCKET = "media-library";

export function AdminMediaView() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("media_assets")
      .select("*")
      .eq("bucket", BUCKET)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) { toast.error(error.message); setLoading(false); return; }
    const paths = (data ?? []).map((a: any) => a.path);
    if (paths.length === 0) { setAssets([]); setLoading(false); return; }
    const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrls(paths, 60 * 60);
    const urlByPath = new Map((signed ?? []).map((s: any) => [s.path, s.signedUrl]));
    setAssets((data as any[]).map((a) => ({ ...a, signedUrl: urlByPath.get(a.path) })));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() ?? "bin";
        const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
          contentType: file.type, cacheControl: "31536000", upsert: false,
        });
        if (upErr) { toast.error(`${file.name}: ${upErr.message}`); continue; }
        const { error: dbErr } = await supabase.from("media_assets").insert({
          bucket: BUCKET, path, mime: file.type, size: file.size,
        } as any);
        if (dbErr) toast.error(`${file.name}: ${dbErr.message}`);
      }
      toast.success("تم الرفع");
      await load();
    } finally {
      setUploading(false);
    }
  };

  const remove = async (a: Asset) => {
    if (!confirm("حذف هذا الملف نهائيًا؟")) return;
    await supabase.storage.from(a.bucket).remove([a.path]);
    const { error } = await supabase.from("media_assets").delete().eq("id", a.id);
    if (error) return toast.error(error.message);
    toast.success("تم الحذف");
    setAssets((prev) => prev.filter((x) => x.id !== a.id));
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("تم نسخ الرابط");
  };

  const filtered = assets.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return a.path.toLowerCase().includes(q) || (a.alt_ar ?? "").toLowerCase().includes(q) || (a.alt_en ?? "").toLowerCase().includes(q);
  });

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">مكتبة الوسائط</h1>
          <p className="mt-1 text-sm text-muted-foreground">إدارة صور ومقاطع الموقع، مع بحث ونسخ روابط موقّعة.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-muted disabled:opacity-50">
            <RefreshCw className="h-4 w-4" /> تحديث
          </button>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90">
            <Upload className="h-4 w-4" /> {uploading ? "جاري الرفع…" : "رفع ملفات"}
            <input type="file" multiple accept="image/*,video/*" className="hidden" disabled={uploading} onChange={(e) => { upload(e.target.files); e.target.value = ""; }} />
          </label>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث بالاسم أو النص البديل…" className="h-10 w-full rounded-full border border-border bg-background pr-10 pl-4 text-sm outline-none focus:border-accent" />
      </div>

      {loading ? (
        <p className="py-16 text-center text-muted-foreground">جاري التحميل…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <ImageIcon className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">لا توجد ملفات. ابدأ برفع أول ملف.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((a) => (
            <div key={a.id} className="group overflow-hidden rounded-xl border border-border bg-card">
              <div className="relative aspect-square bg-muted">
                {a.signedUrl && a.mime?.startsWith("image/") ? (
                  <img src={a.signedUrl} alt={a.alt_ar ?? a.path} className="h-full w-full object-cover" loading="lazy" />
                ) : a.signedUrl && a.mime?.startsWith("video/") ? (
                  <video src={a.signedUrl} className="h-full w-full object-cover" muted />
                ) : (
                  <div className="grid h-full place-items-center text-muted-foreground"><ImageIcon className="h-8 w-8" /></div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  {a.signedUrl && (
                    <button onClick={() => copyUrl(a.signedUrl!)} className="pointer-events-auto rounded-full bg-white/95 p-2 text-black hover:bg-white" title="نسخ الرابط">
                      <Copy className="h-4 w-4" />
                    </button>
                  )}
                  <button onClick={() => remove(a)} className="pointer-events-auto rounded-full bg-red-500 p-2 text-white hover:bg-red-600" title="حذف">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="p-2">
                <p className="truncate text-xs text-muted-foreground" title={a.path}>{a.path.split("/").pop()}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">{a.size ? `${(a.size / 1024).toFixed(0)} KB` : ""}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
