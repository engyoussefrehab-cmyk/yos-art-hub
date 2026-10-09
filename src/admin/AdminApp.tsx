import { useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, KeyRound, Loader2, LogOut, Menu, RotateCcw, Send, X, XCircle } from "lucide-react";
import { AdminStoreProvider, useAdmin } from "./store";
import { getToken, setToken, verifyToken, REPO } from "./github";
import { COLLECTIONS, NAV_GROUPS } from "./schema";
import { CollectionEditor, HistoryPage, MediaLibraryPage, SeoEditor, TextsEditor } from "./editors";
import { inputCls } from "./fields";
import { VisualEditor } from "./visual";
import { AiButton } from "./AiSettings";
import logo from "@/assets/logo-full.png.asset.json";

export default function AdminApp() {
  const [token, setTok] = useState<string | null>(() => getToken());
  const [user, setUser] = useState<string | null>(null);
  const [checking, setChecking] = useState(!!token);

  useEffect(() => {
    if (!token) return;
    verifyToken(token)
      .then((u) => setUser(u))
      .catch(() => {
        setToken(null);
        setTok(null);
      })
      .finally(() => setChecking(false));
  }, [token]);

  if (checking) return <FullScreen><Loader2 className="h-6 w-6 animate-spin" /></FullScreen>;
  if (!token || !user)
    return (
      <Login
        onDone={(t, u) => {
          setToken(t);
          setTok(t);
          setUser(u);
        }}
      />
    );
  return (
    <AdminStoreProvider>
      <Shell user={user} onLogout={() => { setToken(null); setTok(null); setUser(null); }} />
    </AdminStoreProvider>
  );
}

function FullScreen({ children }: { children: React.ReactNode }) {
  return <div dir="rtl" className="grid min-h-screen place-items-center bg-background p-6 font-sans text-foreground">{children}</div>;
}

/* ---------------------------------- login --------------------------------- */

function Login({ onDone }: { onDone: (token: string, user: string) => void }) {
  const [t, setT] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const user = await verifyToken(t.trim());
      onDone(t.trim(), user);
    } catch (e: any) {
      setErr(e?.message === "no-write" ? "المفتاح ده مش معاه صلاحية تعديل على الموقع. اتأكد إنك اخترت Contents: Read and write." : "المفتاح مش صحيح أو انتهى. اعمل واحد جديد بالخطوات اللي تحت.");
    } finally {
      setBusy(false);
    }
  };
  const tokenUrl = `https://github.com/settings/personal-access-tokens/new?name=yrstudio-dashboard&description=Dashboard%20for%20yrstudio.art&target_name=${REPO.owner}&expires_in=none`;
  return (
    <FullScreen>
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <img src={logo.url} alt="Youssef Rehab" className="h-10 w-auto" />
          <h1 className="font-display text-2xl font-bold">لوحة التحكم</h1>
          <p className="text-sm text-muted-foreground">ادخل بمفتاح GitHub بتاعك — بتعمله مرة واحدة بس.</p>
        </div>
        <form onSubmit={submit} className="rounded-3xl border border-border bg-card p-6 shadow-[0_30px_80px_-40px_rgb(0_0_0/0.35)]">
          <label className="mb-1.5 block text-sm font-semibold">مفتاح الدخول</label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input type="password" dir="ltr" autoComplete="current-password" value={t} onChange={(e) => setT(e.target.value)} placeholder="github_pat_…" className={`${inputCls} ps-10 py-3`} />
          </div>
          {err && <div className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
          <button disabled={!t.trim() || busy} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white disabled:opacity-40">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} دخول
          </button>
        </form>
        <details className="mt-5 rounded-2xl border border-border bg-card p-4 text-sm leading-relaxed open:pb-5">
          <summary className="cursor-pointer font-semibold">أول مرة؟ إزاي تعمل المفتاح</summary>
          <ol className="mt-3 list-decimal space-y-2 ps-5 text-muted-foreground">
            <li>
              افتح{" "}
              <a href={tokenUrl} target="_blank" rel="noreferrer" className="font-semibold text-accent underline">
                صفحة عمل المفتاح على GitHub
              </a>{" "}
              (لازم تكون مسجّل دخول).
            </li>
            <li>في <b>Repository access</b> اختار <b>Only select repositories</b> ثم <b dir="ltr">yos-art-hub</b>.</li>
            <li>
              في <b>Permissions</b> ← <b>Repository permissions</b>: خلّي <b>Contents</b> = <b>Read and write</b>، و<b>Actions</b> = <b>Read-only</b>.
            </li>
            <li>دوس <b>Generate token</b>، انسخ المفتاح، والصقه فوق.</li>
          </ol>
          <p className="mt-3 text-xs text-muted-foreground">المفتاح بيتحفظ على الجهاز ده بس، ومش بيتبعت لأي حد غير GitHub.</p>
        </details>
      </div>
    </FullScreen>
  );
}

/* ---------------------------------- shell --------------------------------- */

function Shell({ user, onLogout }: { user: string; onLogout: () => void }) {
  const { ready, loadError, reload } = useAdmin();
  const [view, setView] = useState<string>(() => {
    try {
      return sessionStorage.getItem("yr_admin_view") || "visual";
    } catch {
      return "visual";
    }
  });
  const [openItem, setOpenItem] = useState<number | null>(null);
  const [menu, setMenu] = useState(false);
  const go = (v: string) => {
    setView(v);
    setOpenItem(null);
    setMenu(false);
    try {
      sessionStorage.setItem("yr_admin_view", v);
    } catch {
      /* ignore */
    }
    window.scrollTo({ top: 0 });
  };

  return (
    <div dir="rtl" className="min-h-screen bg-background font-sans text-foreground">
      <TopBar user={user} onLogout={onLogout} onMenu={() => setMenu(true)} />
      <div className="mx-auto flex max-w-[1400px]">
        <Sidebar view={view} go={go} open={menu} onClose={() => setMenu(false)} />
        <main className="min-w-0 flex-1 px-4 pb-32 pt-6 sm:px-8 sm:pt-8">
          {loadError ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
              مقدرتش أجيب محتوى الموقع: {loadError}
              <button type="button" onClick={reload} className="ms-3 font-semibold underline">حاول تاني</button>
            </div>
          ) : !ready ? (
            <div className="grid place-items-center py-32 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : view === "visual" ? (
            <VisualEditor openInCollection={(c, i) => { go(c); setOpenItem(i); }} />
          ) : view === "texts" ? (
            <TextsEditor />
          ) : view === "seo" ? (
            <SeoEditor />
          ) : view === "media" ? (
            <MediaLibraryPage />
          ) : view === "history" ? (
            <HistoryPage />
          ) : COLLECTIONS.some((c) => c.id === view) ? (
            <CollectionEditor key={view} id={view} openItem={openItem} setOpenItem={setOpenItem} />
          ) : null}
        </main>
      </div>
      <PublishBar />
    </div>
  );
}

function TopBar({ user, onLogout, onMenu }: { user: string; onLogout: () => void; onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 sm:px-8">
        <button type="button" onClick={onMenu} className="rounded-full p-2 hover:bg-muted lg:hidden" aria-label="القائمة"><Menu className="h-5 w-5" /></button>
        <img src={logo.url} alt="" className="h-7 w-auto" />
        <span className="hidden text-sm font-semibold text-muted-foreground sm:inline">· لوحة التحكم</span>
        <div className="ms-auto flex items-center gap-2">
          <AiButton />
          <a href="/" target="_blank" rel="noreferrer" className="hidden items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-sm font-semibold sm:inline-flex"><ExternalLink className="h-4 w-4" /> الموقع</a>
          <span className="hidden text-xs text-muted-foreground md:inline" dir="ltr">@{user}</span>
          <button type="button" onClick={onLogout} className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground" title="خروج" aria-label="خروج"><LogOut className="h-4 w-4" /></button>
        </div>
      </div>
    </header>
  );
}

function Sidebar({ view, go, open, onClose }: { view: string; go: (v: string) => void; open: boolean; onClose: () => void }) {
  const { isDirty, ready } = useAdmin();
  const fileOf = (id: string) =>
    id === "texts" ? "src/content/dictionary.json" : id === "seo" ? "src/content/seo.json" : COLLECTIONS.find((c) => c.id === id)?.file;
  const nav = (
    <nav className="space-y-6 p-4">
      {NAV_GROUPS.map((g) => (
        <div key={g.title}>
          <div className="mb-1.5 px-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70">{g.title}</div>
          <div className="space-y-0.5">
            {g.items.map((it) => {
              const f = fileOf(it.id);
              const dirty = ready && f ? isDirty(f) : false;
              return (
                <button key={it.id} type="button" onClick={() => go(it.id)} className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-start text-sm transition ${view === it.id ? "bg-ink font-semibold text-white" : "text-foreground/80 hover:bg-muted"}`}>
                  {it.title}
                  {dirty && <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" title="فيه تعديل" />}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
  return (
    <>
      <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-e border-border lg:block">{nav}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={onClose}>
          <div className="absolute inset-0 bg-black/40" />
          <aside className="absolute inset-y-0 start-0 w-72 overflow-y-auto bg-background shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end p-3"><button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-muted" aria-label="إغلاق"><X className="h-5 w-5" /></button></div>
            {nav}
          </aside>
        </div>
      )}
    </>
  );
}

/* --------------------------------- publish -------------------------------- */

const LABELS: Record<string, string> = Object.fromEntries([
  ["src/content/dictionary.json", "نصوص الموقع"],
  ["src/content/seo.json", "جوجل والمشاركة"],
  ...COLLECTIONS.map((c) => [c.file, c.title.split(" — ")[0]]),
]);

function PublishBar() {
  const { dirtyPaths, uploads, publish, publishing, deploy, discard } = useAdmin();
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const count = dirtyPaths.length;
  const pendingUploads = uploads.length;

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (pendingUploads > 0) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [pendingUploads]);

  const doPublish = async () => {
    setErr(null);
    const names = Array.from(new Set(dirtyPaths.map((p) => LABELS[p] ?? p)));
    try {
      await publish(msg.trim() || `تعديل من لوحة التحكم: ${names.join("، ")}`);
      setMsg("");
    } catch (e: any) {
      if (e?.message === "conflict") setErr("الملفات دي اتعدّلت من مكان تاني من ساعة ما فتحت اللوحة. اعمل تحديث للصفحة (هتلاقي تعديلاتك محفوظة) وحاول تاني.");
      else if (e?.message === "nothing") setErr("مفيش تعديلات للنشر.");
      else setErr(`النشر فشل: ${e?.message ?? e}`);
    }
  };

  const showDeploy = deploy && count === 0;
  if (count === 0 && !showDeploy) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 sm:px-6 sm:pb-6">
      <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card/95 p-3 shadow-[0_30px_80px_-30px_rgb(0_0_0/0.45)] backdrop-blur sm:p-4">
        {count > 0 ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">
                <span className="me-1.5 inline-block h-2 w-2 rounded-full bg-amber-400 align-middle" />
                تعديلات لسه متنشرتش في: {Array.from(new Set(dirtyPaths.map((p) => LABELS[p] ?? p))).join("، ")}
              </div>
              <input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="وصف التعديل (اختياري)" className={`${inputCls} mt-2 py-2`} />
              {err && <div className="mt-2 text-xs text-red-600">{err}</div>}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {confirmDiscard ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 p-1 ps-3 text-xs text-red-700">
                  هتلغي كل التعديلات؟
                  <button type="button" onClick={() => { discard(); setConfirmDiscard(false); }} className="rounded-full bg-red-600 px-3 py-1 font-bold text-white">أيوه</button>
                  <button type="button" onClick={() => setConfirmDiscard(false)} className="rounded-full px-2 py-1 font-semibold">لأ</button>
                </span>
              ) : (
                <button type="button" onClick={() => setConfirmDiscard(true)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted"><RotateCcw className="h-4 w-4" /> إلغاء</button>
              )}
              <button type="button" disabled={publishing} onClick={doPublish} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-accent-foreground disabled:opacity-60 sm:flex-none">
                {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 -scale-x-100" />} نشر التعديلات
              </button>
            </div>
          </div>
        ) : showDeploy ? (
          <DeployStatus />
        ) : null}
      </div>
    </div>
  );
}

function DeployStatus() {
  const { deploy } = useAdmin();
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setSecs(Math.round((Date.now() - (deploy?.startedAt ?? Date.now())) / 1000)), 1000);
    return () => window.clearInterval(t);
  }, [deploy?.startedAt]);
  if (!deploy) return null;
  const s = deploy.state;
  return (
    <div className="flex items-center gap-3 text-sm">
      {s === "done" ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" /> : s === "failed" ? <XCircle className="h-5 w-5 shrink-0 text-red-600" /> : <Loader2 className="h-5 w-5 shrink-0 animate-spin text-accent" />}
      <div className="flex-1">
        {s === "done" ? (
          <>اتنشر — الموقع اتحدّث. <span className="text-muted-foreground">(لو مش شايف التعديل، اعمل تحديث للصفحة)</span></>
        ) : s === "failed" ? (
          <>النشر وقف بسبب خطأ. الموقع لسه على النسخة اللي قبلها، ومحصلش أي ضرر. ابعت لـ Claude «النشر فشل» وهيصلّحه.</>
        ) : (
          <>اتحفظ ✓ — الموقع بيتحدّث دلوقتي… <span className="text-muted-foreground">({secs} ث، عادةً دقيقتين)</span></>
        )}
      </div>
      {s === "done" && <a href="/" target="_blank" rel="noreferrer" className="shrink-0 rounded-full bg-ink px-4 py-2 text-xs font-bold text-white">افتح الموقع</a>}
    </div>
  );
}
