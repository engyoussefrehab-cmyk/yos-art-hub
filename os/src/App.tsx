import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { configured, must, supabase } from "./lib/supabase";
import type { Settings } from "./lib/types";
import { Button, ErrorBox, Loading } from "./ui";
import { Login } from "./pages/Login";
import { Inquiry } from "./pages/Inquiry";
import { Dashboard } from "./pages/Dashboard";
import { Clients, ClientDetail } from "./pages/Clients";
import { Leads } from "./pages/Leads";
import { Services } from "./pages/Services";
import { Quotations, QuotationEditor, QuotationPrint } from "./pages/Quotations";
import { Projects, ProjectDetail } from "./pages/Projects";
import { FollowUps } from "./pages/FollowUps";
import { Templates } from "./pages/Templates";
import { SettingsPage } from "./pages/Settings";

/* ─────────────────────────── settings shared by every private page */

const SettingsCtx = createContext<{ settings: Settings; refresh: () => Promise<void> } | null>(null);
export const useSettings = () => useContext(SettingsCtx)!;

function applyBrand(s: Settings | null) {
  const accent = s?.brand?.accent;
  if (accent && /^#[0-9a-f]{6}$/i.test(accent)) document.documentElement.style.setProperty("--yr-accent", accent);
  else document.documentElement.style.removeProperty("--yr-accent");
}

export function App() {
  const { pathname } = useLocation();
  if (pathname === "/inquiry") return <Inquiry />;
  if (!configured)
    return (
      <Centered>
        <ErrorBox error="Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. See README → Setup." />
      </Centered>
    );
  return <Private />;
}

function Private() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const refresh = async () => {
    const s = await must(supabase.from("settings").select("*").eq("id", 1).maybeSingle());
    setSettings(s as Settings | null);
    applyBrand(s as Settings | null);
  };

  useEffect(() => {
    if (!session) {
      setIsOwner(null);
      return;
    }
    (async () => {
      try {
        const owner = await must(supabase.rpc("is_owner"));
        setIsOwner(Boolean(owner));
        if (owner) await refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    })();
  }, [session?.user.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) return <Centered><ErrorBox error={error} onRetry={() => location.reload()} /></Centered>;
  if (session === undefined) return <Loading />;
  if (!session) return <Login />;
  if (isOwner === null || (isOwner && !settings)) return <Loading />;
  if (!isOwner)
    return (
      <Centered>
        <p className="text-muted">This account does not have access to YR Studio OS.</p>
        <Button className="mt-4" onClick={() => supabase.auth.signOut()}>
          Sign out
        </Button>
      </Centered>
    );

  return (
    <SettingsCtx.Provider value={{ settings: settings!, refresh }}>
      <Shell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/:id" element={<ClientDetail />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/services" element={<Services />} />
          <Route path="/quotations" element={<Quotations />} />
          <Route path="/quotations/:id" element={<QuotationEditor />} />
          <Route path="/quotations/:id/print" element={<QuotationPrint />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/follow-ups" element={<FollowUps />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Shell>
    </SettingsCtx.Provider>
  );
}

function Centered({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">{children}</div>;
}

/* ─────────────────────────── app shell */

const NAV = [
  ["/", "Dashboard"],
  ["/leads", "Leads"],
  ["/clients", "Clients"],
  ["/quotations", "Quotations"],
  ["/projects", "Projects"],
  ["/follow-ups", "Follow-ups"],
  ["/templates", "Templates"],
  ["/services", "Services"],
  ["/settings", "Settings"],
] as const;

export function Logo({ className = "h-7" }: { className?: string }) {
  const { settings } = useSettings() ?? {};
  return <img src={settings?.logo_url || "/brand/logo-full.png"} alt="YR Studio" className={`${className} w-auto invert`} />;
}

function Shell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  if (pathname.endsWith("/print")) return <>{children}</>;

  const nav = (
    <nav className="flex flex-col gap-0.5">
      {NAV.map(([to, label]) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            `rounded-lg px-3 py-2 text-sm transition ${isActive ? "bg-surface-2 font-medium text-fg" : "text-muted hover:bg-surface-2 hover:text-fg"}`
          }
        >
          {({ isActive }) => (
            <span className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-accent" : "bg-transparent"}`} />
              {label}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen md:grid md:grid-cols-[230px_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-line/60 bg-surface p-5 md:flex">
        <Logo />
        <p className="mb-6 mt-2 text-[11px] uppercase tracking-[0.2em] text-muted">Studio OS</p>
        {nav}
        <div className="mt-auto space-y-2 border-t border-line/60 pt-4">
          <a href="/inquiry" target="_blank" rel="noreferrer" className="block text-xs text-muted hover:text-fg">
            Public inquiry form ↗
          </a>
          <button type="button" onClick={() => supabase.auth.signOut()} className="text-xs text-muted hover:text-accent">
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line/60 bg-surface px-4 py-3 md:hidden">
        <Logo className="h-6" />
        <Button small onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          {open ? "Close" : "Menu"}
        </Button>
      </header>
      {open && (
        <div className="fixed inset-x-0 top-[53px] z-20 border-b border-line bg-surface p-4 md:hidden">
          {nav}
          <button type="button" onClick={() => supabase.auth.signOut()} className="mt-3 px-3 text-sm text-muted">
            Sign out
          </button>
        </div>
      )}

      <main className="min-w-0 px-4 py-6 md:px-10 md:py-10">{children}</main>
    </div>
  );
}
