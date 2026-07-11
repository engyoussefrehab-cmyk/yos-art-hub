// Server-only security helpers: IP extraction, audit logging, rate limiting.
import { getRequest, getRequestHeader } from "@tanstack/react-start/server";

export function getClientIp(): string | null {
  try {
    const xf = getRequestHeader("x-forwarded-for");
    if (xf) return xf.split(",")[0]!.trim();
    const cf = getRequestHeader("cf-connecting-ip");
    if (cf) return cf;
    const real = getRequestHeader("x-real-ip");
    if (real) return real;
    const req = getRequest();
    // @ts-ignore - not always available
    return (req as any)?.ip ?? null;
  } catch {
    return null;
  }
}

type Admin = Awaited<ReturnType<typeof getAdmin>>;
async function getAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export async function recordAudit(opts: {
  action: string;
  actorUserId?: string | null;
  actorEmail?: string | null;
  target?: string | null;
  meta?: Record<string, unknown>;
}) {
  const admin = await getAdmin();
  await admin.from("audit_logs").insert({
    action: opts.action,
    actor_user_id: opts.actorUserId ?? null,
    actor_email: opts.actorEmail ?? null,
    target: opts.target ?? null,
    ip: getClientIp(),
    meta: (opts.meta ?? {}) as never,
  });
}

export async function recordAuthAttempt(opts: {
  email: string;
  success: boolean;
  reason?: string | null;
}) {
  const admin = await getAdmin();
  await admin.from("auth_attempts").insert({
    email: opts.email.toLowerCase(),
    ip: getClientIp(),
    success: opts.success,
    reason: opts.reason ?? null,
  });
}

/**
 * Check login rate limit: 
 *  - 8 failed attempts per email in last 15 min → block
 *  - 30 attempts per IP in last 15 min → block
 * Returns { allowed, retryAfterSec, reason }
 */
export async function checkLoginRateLimit(email: string): Promise<{
  allowed: boolean;
  retryAfterSec: number;
  reason?: string;
}> {
  const admin = await getAdmin();
  const ip = getClientIp();
  const windowStart = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  const emailQ = await admin
    .from("auth_attempts")
    .select("created_at", { count: "exact" })
    .eq("email", email.toLowerCase())
    .eq("success", false)
    .gte("created_at", windowStart);

  if ((emailQ.count ?? 0) >= 8) {
    return { allowed: false, retryAfterSec: 900, reason: "email_locked" };
  }

  if (ip) {
    const ipQ = await admin
      .from("auth_attempts")
      .select("created_at", { count: "exact", head: true })
      .eq("ip", ip)
      .gte("created_at", windowStart);
    if ((ipQ.count ?? 0) >= 30) {
      return { allowed: false, retryAfterSec: 900, reason: "ip_locked" };
    }
  }
  return { allowed: true, retryAfterSec: 0 };
}

/** Bootstrap rate limit: 5 attempts per IP per hour. */
export async function checkBootstrapRateLimit(): Promise<{ allowed: boolean; retryAfterSec: number }> {
  const admin = await getAdmin();
  const ip = getClientIp();
  if (!ip) return { allowed: true, retryAfterSec: 0 };
  const windowStart = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const q = await admin
    .from("audit_logs")
    .select("id", { count: "exact", head: true })
    .eq("action", "admin.bootstrap.attempt")
    .eq("ip", ip)
    .gte("created_at", windowStart);
  if ((q.count ?? 0) >= 5) return { allowed: false, retryAfterSec: 3600 };
  return { allowed: true, retryAfterSec: 0 };
}
