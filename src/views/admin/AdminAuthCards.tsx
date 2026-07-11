import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function AdminSignInCard() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr(null); setOk(null);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        setOk("تم إنشاء الحساب. راجع بريدك للتأكيد إن كان مطلوباً، ثم سجّل الدخول.");
      }
    } catch (e: any) {
      setErr(e.message ?? "حدث خطأ.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-6" dir="rtl">
      <div className="w-full rounded-3xl border border-border/70 bg-card p-8 shadow-lg">
        <h1 className="font-display text-2xl font-semibold text-foreground">
          {mode === "in" ? "تسجيل دخول المدير" : "إنشاء حساب مدير"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          الوصول مخصّص لإدارة المحتوى فقط.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">البريد الإلكتروني</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">كلمة المرور</label>
            <input
              type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
              autoComplete={mode === "in" ? "current-password" : "new-password"}
            />
          </div>
          {err && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-500">{err}</p>}
          {ok && <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-500">{ok}</p>}
          <button
            type="submit" disabled={busy}
            className="w-full rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "جاري…" : mode === "in" ? "دخول" : "إنشاء حساب"}
          </button>
        </form>
        <button
          type="button" onClick={() => { setMode(mode === "in" ? "up" : "in"); setErr(null); setOk(null); }}
          className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-accent"
        >
          {mode === "in" ? "ليس لديك حساب؟ أنشئ حساب المدير الأول" : "لديك حساب؟ سجّل الدخول"}
        </button>
      </div>
    </div>
  );
}

export function BootstrapAdminCard({ onDone }: { onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const bootstrap = async () => {
    setBusy(true); setErr(null);
    try {
      const { data, error } = await supabase.rpc("bootstrap_admin");
      if (error) throw error;
      if (data === true) onDone();
      else setErr("يوجد مدير بالفعل. اطلب من المدير الحالي منحك الصلاحية.");
    } catch (e: any) {
      setErr(e.message ?? "تعذّر التنفيذ.");
    } finally {
      setBusy(false);
    }
  };

  const signOut = () => supabase.auth.signOut();

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-6" dir="rtl">
      <div className="w-full rounded-3xl border border-border/70 bg-card p-8 shadow-lg">
        <h1 className="font-display text-2xl font-semibold text-foreground">تفعيل حساب المدير</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          حسابك مسجّل، لكن لا يملك صلاحية إدارة المحتوى بعد. إذا كنت صاحب الموقع، اضغط على الزر
          أدناه لتصبح أول مدير — هذا يعمل مرّة واحدة فقط.
        </p>
        {err && <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-500">{err}</p>}
        <button
          type="button" onClick={bootstrap} disabled={busy}
          className="mt-6 w-full rounded-full bg-accent py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {busy ? "جاري…" : "منحي صلاحية المدير"}
        </button>
        <button type="button" onClick={signOut} className="mt-3 w-full text-center text-xs text-muted-foreground hover:text-accent">
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
}
