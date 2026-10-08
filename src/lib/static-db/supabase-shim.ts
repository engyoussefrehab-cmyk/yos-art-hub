// Static replacement for @supabase/supabase-js.
// The site no longer talks to a database: every table is a JSON snapshot in
// src/data/snapshot/*.json. This module emulates the small part of the
// Supabase query builder the public pages use (select / eq / is / in / order /
// limit / maybeSingle / single, plus one embedded relation like
// "category:insight_categories!inner(id,slug)").
//
// To change content, edit the JSON files in src/data/snapshot and rebuild.

const tableModules = import.meta.glob("../../data/snapshot/*.json", { eager: true }) as Record<
  string,
  { default: unknown[] } | unknown[]
>;

const TABLES: Record<string, any[]> = {};
for (const [file, mod] of Object.entries(tableModules)) {
  const name = file.split("/").pop()!.replace(/\.json$/, "");
  if (name.startsWith("_")) continue;
  const rows = (mod as any).default ?? mod;
  TABLES[name] = Array.isArray(rows) ? rows : [];
}

type Filter = (row: any) => boolean;
type Embed = { alias: string; table: string; inner: boolean; cols: string[] | "*" };

function parseSelect(sel: string): { cols: string[] | "*"; embeds: Embed[] } {
  const embeds: Embed[] = [];
  // pull out embedded relations: alias:table!inner(cols) or table(cols)
  const rest = sel.replace(
    /([a-zA-Z_]+:)?([a-zA-Z_]+)(!inner)?\(([^)]*)\)/g,
    (_m, alias, table, inner, cols) => {
      const c = String(cols).split(",").map((s: string) => s.trim()).filter(Boolean);
      embeds.push({
        alias: alias ? String(alias).slice(0, -1) : table,
        table,
        inner: !!inner,
        cols: c.length === 1 && c[0] === "*" ? "*" : c,
      });
      return "";
    },
  );
  const parts = rest.split(",").map((s) => s.trim()).filter(Boolean);
  const cols = parts.length === 0 || parts.includes("*") ? "*" : parts;
  return { cols, embeds };
}

function pick(row: any, cols: string[] | "*") {
  if (cols === "*") return { ...row };
  const out: any = {};
  for (const c of cols) out[c] = row[c];
  return out;
}

function singularFk(table: string) {
  // insight_categories -> category_id ; portfolio_projects -> project_id
  const last = table.split("_").pop()!;
  const singular = last.endsWith("ies") ? last.slice(0, -3) + "y" : last.replace(/s$/, "");
  return `${singular}_id`;
}

class Query implements PromiseLike<{ data: any; error: null; count: number | null }> {
  private filters: Filter[] = [];
  private orders: { col: string; asc: boolean; nullsFirst?: boolean }[] = [];
  private max: number | null = null;
  private mode: "many" | "single" | "maybe" = "many";
  private cols: string[] | "*" = "*";
  private embeds: Embed[] = [];
  private head = false;

  constructor(private table: string) {}

  select(sel = "*", opts?: { count?: string; head?: boolean }) {
    const p = parseSelect(sel);
    this.cols = p.cols;
    this.embeds = p.embeds;
    this.head = !!opts?.head;
    return this;
  }
  eq(col: string, v: any) { this.filters.push((r) => r[col] === v); return this; }
  neq(col: string, v: any) { this.filters.push((r) => r[col] !== v); return this; }
  is(col: string, v: any) { this.filters.push((r) => (v === null ? r[col] == null : r[col] === v)); return this; }
  in(col: string, vs: any[]) { this.filters.push((r) => vs.includes(r[col])); return this; }
  gt(col: string, v: any) { this.filters.push((r) => r[col] > v); return this; }
  gte(col: string, v: any) { this.filters.push((r) => r[col] >= v); return this; }
  lt(col: string, v: any) { this.filters.push((r) => r[col] < v); return this; }
  lte(col: string, v: any) { this.filters.push((r) => r[col] <= v); return this; }
  not(col: string, op: string, v: any) {
    if (op === "is") this.filters.push((r) => (v === null ? r[col] != null : r[col] !== v));
    else if (op === "eq") this.filters.push((r) => r[col] !== v);
    return this;
  }
  contains(col: string, vs: any[]) {
    this.filters.push((r) => Array.isArray(r[col]) && vs.every((v) => r[col].includes(v)));
    return this;
  }
  order(col: string, opts?: { ascending?: boolean; nullsFirst?: boolean }) {
    this.orders.push({ col, asc: opts?.ascending !== false, nullsFirst: opts?.nullsFirst });
    return this;
  }
  limit(n: number) { this.max = n; return this; }
  range(from: number, to: number) { this.max = to + 1; (this as any).offset = from; return this; }
  single() { this.mode = "single"; return this; }
  maybeSingle() { this.mode = "maybe"; return this; }
  // writes are no-ops on a static site
  insert() { return this; }
  update() { return this; }
  upsert() { return this; }
  delete() { return this; }

  private run() {
    let rows = (TABLES[this.table] ?? []).slice();
    rows = rows.filter((r) => this.filters.every((f) => f(r)));
    for (const o of [...this.orders].reverse()) {
      rows.sort((a, b) => {
        const x = a[o.col], y = b[o.col];
        if (x == null && y == null) return 0;
        if (x == null) return o.nullsFirst ?? !o.asc ? -1 : 1;
        if (y == null) return o.nullsFirst ?? !o.asc ? 1 : -1;
        const c = x < y ? -1 : x > y ? 1 : 0;
        return o.asc ? c : -c;
      });
    }
    const offset = (this as any).offset ?? 0;
    if (offset) rows = rows.slice(offset);
    if (this.max != null) rows = rows.slice(0, this.max);

    let out = rows.map((r) => {
      const o = pick(r, this.cols);
      for (const e of this.embeds) {
        const target = TABLES[e.table] ?? [];
        const fk = singularFk(e.table);
        const match = target.find((t) => t.id === r[fk]);
        o[e.alias] = match ? pick(match, e.cols) : null;
      }
      return o;
    });
    for (const e of this.embeds) if (e.inner) out = out.filter((o) => o[e.alias] != null);

    const count = out.length;
    if (this.head) return { data: null, error: null, count };
    if (this.mode === "many") return { data: out, error: null, count };
    return { data: out[0] ?? null, error: null, count };
  }

  then<A = any, B = never>(
    onOk?: ((v: { data: any; error: null; count: number | null }) => A | PromiseLike<A>) | null,
    onErr?: ((e: any) => B | PromiseLike<B>) | null,
  ): PromiseLike<A | B> {
    return Promise.resolve(this.run()).then(onOk, onErr);
  }
}

const noSession = { data: { session: null, user: null }, error: null };
const auth = {
  getSession: async () => noSession,
  getUser: async () => noSession,
  getClaims: async () => ({ data: null, error: null }),
  onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
  signOut: async () => ({ error: null }),
  signInWithPassword: async () => ({ data: null, error: { message: "Disabled on static site" } }),
};

export function createClient(..._args: any[]): any {
  return {
    from: (table: string) => new Query(table),
    rpc: async () => ({ data: null, error: null }),
    auth,
    storage: {
      from: () => ({
        getPublicUrl: (p: string) => ({ data: { publicUrl: p } }),
        download: async () => ({ data: null, error: { message: "static" } }),
      }),
    },
    channel: () => ({ on() { return this; }, subscribe() { return this; } }),
    removeChannel() {},
  };
}

export type SupabaseClient = any;
export type Session = any;
export type User = any;
export default { createClient };
