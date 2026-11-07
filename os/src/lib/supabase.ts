import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const configured = Boolean(url && key);

// The anon key is public by design: Row Level Security decides what it can do.
export const supabase = createClient(url || "http://localhost", key || "missing", {
  auth: { persistSession: true, autoRefreshToken: true },
});

/**
 * Throws on a Supabase error so callers can use plain try/catch.
 * (For .maybeSingle() the result can still be null — callers cast to `X | null`.)
 */
export async function must<T>(p: PromiseLike<{ data: T; error: { message: string } | null }>): Promise<NonNullable<T>> {
  const { data, error } = await p;
  if (error) throw new Error(error.message);
  return data as NonNullable<T>;
}
