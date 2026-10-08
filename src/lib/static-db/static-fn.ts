// Drop-in replacement for TanStack Start's createServerFn on a static site.
// The handler runs locally (in the browser or at prerender time) and reads
// from the JSON snapshot via the static Supabase shim — no server needed.

type Handler<I, O> = (ctx: { data: I }) => Promise<O> | O;

export function createServerFn(_opts?: { method?: string }) {
  const builder = {
    middleware(_m: unknown) {
      return builder;
    },
    inputValidator(_v: unknown) {
      return builder;
    },
    validator(_v: unknown) {
      return builder;
    },
    handler<I = any, O = any>(fn: Handler<I, O>) {
      return async (arg?: { data?: I }) => fn({ data: (arg?.data ?? ({} as I)) as I });
    },
  };
  return builder;
}
