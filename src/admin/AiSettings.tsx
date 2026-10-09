import { useState } from "react";
import { KeyRound, Loader2, Sparkles, X } from "lucide-react";
import { ai, testKey, useAi } from "./translate";
import { Toggle, inputCls } from "./fields";

export function AiButton() {
  const { ready, auto } = useAi();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold ${auto ? "bg-accent/10 text-accent" : "border border-border text-muted-foreground"}`}
        title="الترجمة الذكية"
      >
        <Sparkles className="h-4 w-4" />
        <span className="hidden sm:inline">{auto ? "الترجمة شغّالة" : ready ? "الترجمة متوقفة" : "الترجمة الذكية"}</span>
      </button>
      {open && <AiSettings onClose={() => setOpen(false)} />}
    </>
  );
}

function AiSettings({ onClose }: { onClose: () => void }) {
  const { ready, auto } = useAi();
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const save = async () => {
    setBusy(true);
    setErr(null);
    try {
      await testKey(key.trim());
      ai.setKey(key.trim());
      ai.setAuto(true);
      setKey("");
    } catch (e: any) {
      setErr(e?.status === 401 ? "المفتاح مش صحيح." : e?.status === 400 && /credit|balance/i.test(e?.message) ? "الحساب محتاج رصيد — اشحن من Plans & Billing في Console." : `مقدرتش أتأكد من المفتاح: ${e?.message ?? e}`);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div dir="rtl" className="fixed inset-0 z-[300] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-3xl bg-card p-6 shadow-2xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-display text-lg font-bold"><Sparkles className="h-5 w-5 text-accent" /> الترجمة الذكية</div>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 hover:bg-muted" aria-label="إغلاق"><X className="h-5 w-5" /></button>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          اكتب بالعربي بس — والإنجليزي يتكتب لوحده بأسلوب احترافي بعد ثانية من ما توقف كتابة. لو عدّلت الإنجليزي بإيدك، مش هيتغيّر تاني إلا لو دوست «ترجم».
        </p>

        {ready ? (
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-muted px-4 py-3">
              <span className="text-sm font-semibold">ترجمة تلقائية وأنا بكتب</span>
              <Toggle checked={auto} onChange={(v) => ai.setAuto(v)} />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>المفتاح محفوظ على الجهاز ده ✓</span>
              <button type="button" onClick={() => ai.setKey(null)} className="font-semibold text-red-600 hover:underline">شيل المفتاح</button>
            </div>
          </div>
        ) : (
          <div className="mt-5">
            <label className="mb-1.5 block text-sm font-semibold">مفتاح Claude API</label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input type="password" dir="ltr" value={key} onChange={(e) => setKey(e.target.value)} placeholder="sk-ant-…" className={`${inputCls} ps-10`} />
            </div>
            {err && <div className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
            <button type="button" disabled={!key.trim() || busy} onClick={save} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white disabled:opacity-40">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} تفعيل
            </button>
            <ol className="mt-5 list-decimal space-y-1.5 ps-5 text-xs leading-relaxed text-muted-foreground">
              <li>ادخل على <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" className="font-semibold text-accent underline">console.anthropic.com</a> وسجّل دخول.</li>
              <li>لو أول مرة: اشحن رصيد صغير من <b>Plans &amp; Billing</b> (5$ تكفي شهور).</li>
              <li>دوس <b>Create Key</b>، انسخه، والصقه هنا.</li>
            </ol>
            <p className="mt-3 text-[11px] text-muted-foreground">المفتاح بيتحفظ على الجهاز ده بس، وبيتبعت لـ Anthropic بس وقت الترجمة.</p>
          </div>
        )}
      </div>
    </div>
  );
}
