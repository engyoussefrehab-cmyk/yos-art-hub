import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";

// The dashboard only runs in the browser (it talks to GitHub with the owner's token).
const AdminApp = lazy(() => import("@/admin/AdminApp"));

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "لوحة التحكم — YR Studio" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminRoute,
});

function AdminRoute() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const spinner = <div dir="rtl" className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">جاري التحميل…</div>;
  if (!mounted) return spinner;
  return (
    <Suspense fallback={spinner}>
      <AdminApp />
    </Suspense>
  );
}
