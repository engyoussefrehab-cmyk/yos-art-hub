/**
 * Image upload widgets used by the generic CRUD engine.
 * Files go to the private `portfolio-covers` bucket and are served through the
 * public proxy route `/api/public/portfolio/cover/*`.
 */

import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, X, ArrowLeft, ArrowRight } from "lucide-react";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/svg+xml"];
const MAX_MB = 8;
const MAX_GALLERY = 30;

function validate(file: File): string | null {
  if (!ACCEPTED.includes(file.type)) return `Unsupported format: ${file.name}`;
  if (file.size > MAX_MB * 1024 * 1024) return `${file.name} is larger than ${MAX_MB}MB`;
  return null;
}

async function upload(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const path = `projects/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("portfolio-covers").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;
  return `/api/public/portfolio/cover/${path}`;
}

export function SingleImageField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handle(file?: File | null) {
    if (!file) return;
    const v = validate(file);
    if (v) return setErr(v);
    setErr(null);
    setBusy(true);
    try {
      onChange(await upload(file));
    } catch (e: any) {
      setErr(e?.message ?? "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-3">
        <div className="h-20 w-28 shrink-0 overflow-hidden rounded-md border bg-muted">
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
              No image
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              {busy ? <Loader2 className="me-1 h-3.5 w-3.5 animate-spin" /> : <Upload className="me-1 h-3.5 w-3.5" />}
              Upload
            </Button>
            {value && (
              <Button type="button" size="sm" variant="ghost" onClick={() => onChange("")}>
                <X className="me-1 h-3.5 w-3.5" />
                Remove
              </Button>
            )}
          </div>
          <Input
            value={value ?? ""}
            placeholder="https://… or /api/public/portfolio/cover/…"
            onChange={(e) => onChange(e.target.value)}
            className="text-xs"
          />
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="hidden"
        onChange={(e) => handle(e.target.files?.[0])}
      />
      {err && <span className="text-[10px] text-destructive">{err}</span>}
    </div>
  );
}

export function GalleryField({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const items = Array.isArray(value) ? value : [];

  async function handle(files: FileList | null) {
    if (!files?.length) return;
    const list = Array.from(files).slice(0, MAX_GALLERY - items.length);
    const bad = list.map(validate).find(Boolean);
    if (bad) return setErr(bad);
    setErr(null);
    setBusy(true);
    setProgress({ done: 0, total: list.length });
    const urls: string[] = [];
    try {
      for (let i = 0; i < list.length; i++) {
        urls.push(await upload(list[i]));
        setProgress({ done: i + 1, total: list.length });
      }
      onChange([...items, ...urls]);
    } catch (e: any) {
      setErr(e?.message ?? "Upload failed");
      if (urls.length) onChange([...items, ...urls]);
    } finally {
      setBusy(false);
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function move(idx: number, dir: number) {
    const arr = [...items];
    const j = idx + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[idx], arr[j]] = [arr[j], arr[idx]];
    onChange(arr);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy || items.length >= MAX_GALLERY}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? <Loader2 className="me-1 h-3.5 w-3.5 animate-spin" /> : <Upload className="me-1 h-3.5 w-3.5" />}
          {busy && progress ? `${progress.done}/${progress.total}` : "Upload images"}
        </Button>
        <span className="text-[10px] text-muted-foreground">
          {items.length}/{MAX_GALLERY}
        </span>
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED.join(",")}
        className="hidden"
        onChange={(e) => handle(e.target.files)}
      />
      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {items.map((url, i) => (
            <div key={`${url}-${i}`} className="group relative overflow-hidden rounded-md border">
              <img src={url} alt="" className="h-24 w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-background/85 px-1 py-0.5 opacity-0 transition group-hover:opacity-100">
                <button type="button" className="p-0.5 disabled:opacity-30" disabled={i === 0} onClick={() => move(i, -1)}>
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="p-0.5 text-destructive"
                  onClick={() => onChange(items.filter((_, k) => k !== i))}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="p-0.5 disabled:opacity-30"
                  disabled={i === items.length - 1}
                  onClick={() => move(i, 1)}
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {err && <span className="text-[10px] text-destructive">{err}</span>}
    </div>
  );
}
