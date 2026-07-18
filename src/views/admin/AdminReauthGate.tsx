import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminLang } from "@/i18n/admin-lang";
import { Lock } from "lucide-react";

export const REAUTH_KEY = "admin_reauth_ok";

export function AdminReauthGate({ email, onSuccess }: { email: string; onSuccess: () => void }) {
  const { dir } = useAdminLang();
  const isRtl = dir === "rtl";
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(isRtl ? "كلمة المرور غير صحيحة" : "Incorrect password");
      return;
    }
    sessionStorage.setItem(REAUTH_KEY, "1");
    onSuccess();
  };

  const signOut = async () => {
    sessionStorage.removeItem(REAUTH_KEY);
    await supabase.auth.signOut();
  };

  return (
    <div dir={dir} className="min-h-[80vh] flex items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm space-y-5 rounded-2xl border border-border/70 bg-card p-6 shadow-sm"
      >
        <div className="flex flex-col items-center text-center gap-2">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-semibold">
            {isRtl ? "تأكيد الدخول للوحة التحكم" : "Confirm admin access"}
          </h1>
          <p className="text-xs text-muted-foreground">
            {isRtl
              ? "لأسباب أمنية، يرجى إعادة إدخال كلمة المرور للمتابعة."
              : "For security, please re-enter your password to continue."}
          </p>
        </div>
        <div className="space-y-2">
          <Label className="text-xs">{isRtl ? "البريد الإلكتروني" : "Email"}</Label>
          <Input value={email} readOnly disabled className="opacity-70" />
        </div>
        <div className="space-y-2">
          <Label className="text-xs" htmlFor="reauth-password">
            {isRtl ? "كلمة المرور" : "Password"}
          </Label>
          <Input
            id="reauth-password"
            type="password"
            autoFocus
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <div className="space-y-2">
          <Button type="submit" className="w-full" disabled={loading || !password}>
            {loading
              ? isRtl ? "جاري التحقق…" : "Verifying…"
              : isRtl ? "متابعة" : "Continue"}
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={signOut}>
            {isRtl ? "تسجيل الخروج" : "Sign out"}
          </Button>
        </div>
      </form>
    </div>
  );
}
