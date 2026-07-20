/**
 * Feature Flag client — reads `cms_feature_flags` and evaluates for the
 * current user. Any signed-in user can read flag state (see RLS policy);
 * only admins can toggle.
 *
 * Usage:
 *   const on = useFeatureFlag("cms.homepage_builder");
 *   if (!on) return <ComingSoonPanel />;
 */

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface FeatureFlagRow {
  key: string;
  label: string;
  enabled: boolean;
  rollout_percent: number;
  enabled_roles: string[];
  enabled_user_ids: string[];
}

let cache: Map<string, FeatureFlagRow> | null = null;
let inflight: Promise<Map<string, FeatureFlagRow>> | null = null;
const listeners = new Set<() => void>();

async function loadFlags(): Promise<Map<string, FeatureFlagRow>> {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = (async () => {
    const { data } = await supabase
      .from("cms_feature_flags" as never)
      .select("key,label,enabled,rollout_percent,enabled_roles,enabled_user_ids");
    const m = new Map<string, FeatureFlagRow>();
    for (const row of (data ?? []) as FeatureFlagRow[]) m.set(row.key, row);
    cache = m;
    inflight = null;
    listeners.forEach((l) => l());
    return m;
  })();
  return inflight;
}

export function invalidateFlags() {
  cache = null;
  listeners.forEach((l) => l());
}

export function evaluateFlag(
  flag: FeatureFlagRow | undefined,
  ctx: { userId?: string | null; roles?: string[] } = {},
): boolean {
  if (!flag) return false;
  if (ctx.userId && flag.enabled_user_ids?.includes(ctx.userId)) return true;
  if (ctx.roles?.some((r) => flag.enabled_roles?.includes(r))) return true;
  if (!flag.enabled) return false;
  if (flag.rollout_percent >= 100) return true;
  if (flag.rollout_percent <= 0) return true; // enabled globally, no percent gate
  // Simple deterministic bucketing by userId hash
  if (ctx.userId) {
    let h = 0;
    for (let i = 0; i < ctx.userId.length; i++) h = (h * 31 + ctx.userId.charCodeAt(i)) | 0;
    return Math.abs(h) % 100 < flag.rollout_percent;
  }
  return true;
}

export function useFeatureFlag(
  key: string,
  ctx: { userId?: string | null; roles?: string[] } = {},
): boolean {
  const [flags, setFlags] = useState<Map<string, FeatureFlagRow> | null>(cache);
  useEffect(() => {
    let alive = true;
    loadFlags().then((m) => {
      if (alive) setFlags(m);
    });
    const l = () => setFlags(cache);
    listeners.add(l);
    return () => {
      alive = false;
      listeners.delete(l);
    };
  }, []);
  return evaluateFlag(flags?.get(key), ctx);
}
