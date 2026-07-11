import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * One-time bootstrap: if no admin exists yet, grant the current authenticated
 * caller the 'admin' role. Rate-limited by IP (5/hour) and fully audited.
 */
export const bootstrapAdminFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { checkBootstrapRateLimit, recordAudit } = await import("./security.server");

    const rl = await checkBootstrapRateLimit();
    if (!rl.allowed) {
      await recordAudit({
        action: "admin.bootstrap.blocked",
        actorUserId: context.userId,
        actorEmail: context.claims?.email ?? null,
        meta: { retryAfterSec: rl.retryAfterSec },
      });
      throw new Error("تم تجاوز الحد المسموح. حاول لاحقاً.");
    }

    await recordAudit({
      action: "admin.bootstrap.attempt",
      actorUserId: context.userId,
      actorEmail: context.claims?.email ?? null,
    });

    const { count, error: countErr } = await supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");
    if (countErr) throw new Error(countErr.message);
    if ((count ?? 0) > 0) {
      await recordAudit({
        action: "admin.bootstrap.denied",
        actorUserId: context.userId,
        actorEmail: context.claims?.email ?? null,
        meta: { reason: "admin_exists" },
      });
      return { granted: false as const };
    }

    const { error: insErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" });
    if (insErr) throw new Error(insErr.message);

    await recordAudit({
      action: "admin.bootstrap.granted",
      actorUserId: context.userId,
      actorEmail: context.claims?.email ?? null,
    });
    return { granted: true as const };
  });
