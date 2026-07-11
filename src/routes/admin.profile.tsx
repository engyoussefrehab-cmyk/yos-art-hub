import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

function AdminProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getUser();
      if (!sess.user) return;
      setEmail(sess.user.email ?? "");
      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, bio")
        .eq("user_id", sess.user.id)
        .maybeSingle();
      if (data) {
        setDisplayName(data.display_name ?? "");
        setAvatarUrl(data.avatar_url ?? "");
        setBio(data.bio ?? "");
      }
      setLoading(false);
    })();
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    const { data: sess } = await supabase.auth.getUser();
    if (!sess.user) {
      setSaving(false);
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .upsert(
        {
          user_id: sess.user.id,
          display_name: displayName || null,
          avatar_url: avatarUrl || null,
          bio: bio || null,
        },
        { onConflict: "user_id" },
      );
    setSaving(false);
    if (error) toast.error("تعذر حفظ الملف الشخصي: " + error.message);
    else toast.success("تم حفظ الملف الشخصي");
  };

  const changePassword = async () => {
    if (newPassword.length < 8) {
      toast.error("كلمة المرور يجب ألا تقل عن 8 أحرف");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast.error("تعذر تحديث كلمة المرور: " + error.message);
    else {
      toast.success("تم تحديث كلمة المرور");
      setNewPassword("");
    }
  };

  const signOutEverywhere = async () => {
    const { error } = await supabase.auth.signOut({ scope: "global" });
    if (error) toast.error("تعذر تسجيل الخروج: " + error.message);
    else window.location.href = "/admin";
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">جاري التحميل…</div>;
  }

  return (
    <div dir="rtl" className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">الملف الشخصي</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          بيانات المؤلف تُستخدم في المقالات وأسفل الصفحات على الموقع.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-border/70 bg-card p-6">
        <div className="grid gap-2">
          <Label>البريد الإلكتروني</Label>
          <Input value={email} disabled />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="display_name">اسم العرض</Label>
          <Input
            id="display_name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="يوسف رحاب"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="avatar_url">رابط الصورة الشخصية</Label>
          <Input
            id="avatar_url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://…"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="bio">نبذة</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="مصمم هويات بصرية…"
          />
        </div>
        <div className="pt-2">
          <Button onClick={saveProfile} disabled={saving}>
            {saving ? "جاري الحفظ…" : "حفظ التغييرات"}
          </Button>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-border/70 bg-card p-6">
        <div>
          <h2 className="font-semibold">الأمان</h2>
          <p className="text-xs text-muted-foreground">تغيير كلمة المرور أو إنهاء الجلسات على جميع الأجهزة.</p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">كلمة مرور جديدة</Label>
          <Input
            id="password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="8 أحرف على الأقل"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={changePassword} disabled={!newPassword}>
            تحديث كلمة المرور
          </Button>
          <Button variant="outline" onClick={signOutEverywhere}>
            إنهاء الجلسة على جميع الأجهزة
          </Button>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/admin/profile")({
  component: AdminProfile,
});
