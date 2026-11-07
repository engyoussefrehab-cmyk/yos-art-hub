import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Button } from "../ui";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) setMsg({ ok: false, text: error.message === "Invalid login credentials" ? "Wrong email or password." : error.message });
  };

  const reset = async () => {
    if (!email.trim()) return setMsg({ ok: false, text: "Enter your email first." });
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${location.origin}/settings` });
    setMsg(error ? { ok: false, text: error.message } : { ok: true, text: "If this email has an account, a reset link is on its way." });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <form onSubmit={signIn} className="w-full max-w-sm">
        <img src="/brand/logo-full.png" alt="YR Studio" className="h-9 w-auto invert" />
        <h1 className="mt-8 text-2xl font-semibold">Studio OS</h1>
        <p className="mt-1 text-sm text-muted">Sign in to manage leads, quotations and projects.</p>
        <div className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-muted">
              Email
            </label>
            <input id="email" type="email" autoComplete="username" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-muted">
              Password
            </label>
            <input id="password" type="password" autoComplete="current-password" required className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>
        {msg && <p className={`mt-4 text-sm ${msg.ok ? "text-success" : "text-accent"}`}>{msg.text}</p>}
        <Button kind="primary" type="submit" disabled={busy} className="mt-6 w-full py-2.5">
          {busy ? "Signing in…" : "Sign in"}
        </Button>
        <button type="button" onClick={reset} className="mt-4 w-full text-center text-xs text-muted hover:text-fg">
          Forgot password?
        </button>
      </form>
    </div>
  );
}
