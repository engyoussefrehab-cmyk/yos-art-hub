/**
 * Generic CRUD engine — server functions used by every registered entity.
 *
 * All functions run as the signed-in Supabase user; RLS enforces per-entity
 * write permissions (admin/editor). Universal behavior:
 *
 *   - list / get / create / update
 *   - softDelete / restore                (deleted_at column)
 *   - archive / unarchive                 (workflow_state="archived", is_archived flag)
 *   - duplicate                           (deep copy of scalar columns)
 *   - setWorkflow                         (draft|in_review|approved|published|archived)
 *   - listRevisions / restoreRevision     (cms_revisions)
 *   - listActivity                        (cms_events)
 *   - listDependencies                    (cms_dependencies, both directions)
 *   - audit                               (cms_audit_log)
 *
 * The functions consult `getEntity()` from the entity registry to resolve
 * the physical table + primary key. Adding a new entity requires ZERO new
 * server code — only a `registerEntity({...})` call.
 */

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getEntity, type WorkflowState } from "@/admin/lib/entity-registry";
import "@/admin/modules/register-all"; // ensure entities are registered on server too

type SupabaseAny = any; // context.supabase typed loosely to keep this generic

function resolveEntity(key: string) {
  const def = getEntity(key);
  if (!def) throw new Error(`Unknown entity "${key}"`);
  return def;
}

async function audit(
  supabase: SupabaseAny,
  actor: string | null,
  entityType: string,
  entityId: string | null,
  action: string,
  metadata: Record<string, unknown> = {},
) {
  await supabase.from("cms_audit_log").insert({
    actor_id: actor,
    entity_type: entityType,
    entity_id: entityId,
    action,
    metadata,
  });
}

/* --------------------------------- LIST --------------------------------- */

export const cmsList = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      entityKey: string;
      search?: string;
      workflowState?: WorkflowState | "any";
      includeArchived?: boolean;
      includeDeleted?: boolean;
      page?: number;
      pageSize?: number;
      orderBy?: string;
      ascending?: boolean;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    const def = resolveEntity(data.entityKey);
    const supabase = (context as any).supabase as SupabaseAny;
    const page = Math.max(1, data.page ?? 1);
    const pageSize = Math.min(200, Math.max(1, data.pageSize ?? 25));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let q = supabase.from(def.table).select("*", { count: "exact" });

    if (!data.includeDeleted) q = q.is("deleted_at", null);
    if (!data.includeArchived && def.supportsWorkflow) {
      q = q.neq("workflow_state", "archived");
    }
    if (data.workflowState && data.workflowState !== "any") {
      q = q.eq("workflow_state", data.workflowState);
    }
    if (data.search && data.search.trim()) {
      const s = `%${data.search.trim()}%`;
      const cols = ["name_ar", "name_en", "slug", "title_ar", "title_en"];
      const orExpr = cols.map((c) => `${c}.ilike.${s}`).join(",");
      q = q.or(orExpr);
    }
    q = q
      .order(data.orderBy ?? "updated_at", { ascending: data.ascending ?? false })
      .range(from, to);

    const { data: rows, error, count } = await q;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [], total: count ?? 0, page, pageSize };
  });

/* ---------------------------------- GET --------------------------------- */

export const cmsGet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { entityKey: string; id: string }) => d)
  .handler(async ({ data, context }) => {
    const def = resolveEntity(data.entityKey);
    const supabase = (context as any).supabase as SupabaseAny;
    const { data: row, error } = await supabase
      .from(def.table)
      .select("*")
      .eq(def.pkColumn ?? "id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

/* -------------------------------- CREATE -------------------------------- */

export const cmsCreate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { entityKey: string; values: Record<string, unknown> }) => d)
  .handler(async ({ data, context }) => {
    const def = resolveEntity(data.entityKey);
    const supabase = (context as any).supabase as SupabaseAny;
    const actor = (context as any).userId as string | null;

    const { data: row, error } = await supabase
      .from(def.table)
      .insert(data.values as any)
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    await audit(supabase, actor, def.key, row.id, "create", {
      slug: row.slug ?? null,
    });
    return row;
  });

/* -------------------------------- UPDATE -------------------------------- */

export const cmsUpdate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: { entityKey: string; id: string; values: Record<string, unknown> }) => d,
  )
  .handler(async ({ data, context }) => {
    const def = resolveEntity(data.entityKey);
    const supabase = (context as any).supabase as SupabaseAny;
    const actor = (context as any).userId as string | null;

    const { data: row, error } = await supabase
      .from(def.table)
      .update(data.values as any)
      .eq(def.pkColumn ?? "id", data.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    await audit(supabase, actor, def.key, data.id, "update", {
      keys: Object.keys(data.values),
    });
    return row;
  });

/* ---------------------------- SOFT DELETE / RESTORE -------------------- */

export const cmsSoftDelete = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { entityKey: string; id: string }) => d)
  .handler(async ({ data, context }) => {
    const def = resolveEntity(data.entityKey);
    const supabase = (context as any).supabase as SupabaseAny;
    const actor = (context as any).userId as string | null;
    const { error } = await supabase
      .from(def.table)
      .update({ deleted_at: new Date().toISOString() } as any)
      .eq(def.pkColumn ?? "id", data.id);
    if (error) throw new Error(error.message);
    await audit(supabase, actor, def.key, data.id, "soft_delete");
    return { ok: true };
  });

export const cmsRestore = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { entityKey: string; id: string }) => d)
  .handler(async ({ data, context }) => {
    const def = resolveEntity(data.entityKey);
    const supabase = (context as any).supabase as SupabaseAny;
    const actor = (context as any).userId as string | null;
    const { error } = await supabase
      .from(def.table)
      .update({ deleted_at: null } as any)
      .eq(def.pkColumn ?? "id", data.id);
    if (error) throw new Error(error.message);
    await audit(supabase, actor, def.key, data.id, "restore");
    return { ok: true };
  });

/* --------------------------- ARCHIVE / UNARCHIVE ----------------------- */

export const cmsArchive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { entityKey: string; id: string }) => d)
  .handler(async ({ data, context }) => {
    const def = resolveEntity(data.entityKey);
    const supabase = (context as any).supabase as SupabaseAny;
    const actor = (context as any).userId as string | null;
    const patch: Record<string, unknown> = { workflow_state: "archived" };
    // Legacy boolean if present in the table
    patch.is_archived = true;
    const { error } = await supabase
      .from(def.table)
      .update(patch as any)
      .eq(def.pkColumn ?? "id", data.id);
    if (error) throw new Error(error.message);
    await audit(supabase, actor, def.key, data.id, "archive");
    return { ok: true };
  });

export const cmsUnarchive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { entityKey: string; id: string }) => d)
  .handler(async ({ data, context }) => {
    const def = resolveEntity(data.entityKey);
    const supabase = (context as any).supabase as SupabaseAny;
    const actor = (context as any).userId as string | null;
    const { error } = await supabase
      .from(def.table)
      .update({ workflow_state: "draft", is_archived: false } as any)
      .eq(def.pkColumn ?? "id", data.id);
    if (error) throw new Error(error.message);
    await audit(supabase, actor, def.key, data.id, "unarchive");
    return { ok: true };
  });

/* ------------------------------- WORKFLOW ------------------------------- */

export const cmsSetWorkflow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: { entityKey: string; id: string; state: WorkflowState }) => d,
  )
  .handler(async ({ data, context }) => {
    const def = resolveEntity(data.entityKey);
    const supabase = (context as any).supabase as SupabaseAny;
    const actor = (context as any).userId as string | null;
    const patch: Record<string, unknown> = { workflow_state: data.state };
    if (data.state === "published") {
      patch.status = "published";
      patch.published_at = new Date().toISOString();
    } else if (data.state === "archived") {
      patch.is_archived = true;
    } else {
      patch.status = "draft";
      patch.is_archived = false;
    }
    const { error } = await supabase
      .from(def.table)
      .update(patch as any)
      .eq(def.pkColumn ?? "id", data.id);
    if (error) throw new Error(error.message);
    await audit(supabase, actor, def.key, data.id, "workflow_transition", {
      to: data.state,
    });
    return { ok: true };
  });

/* ------------------------------ DUPLICATE ------------------------------- */

const DUP_SKIP = new Set([
  "id",
  "created_at",
  "updated_at",
  "published_at",
  "views_count",
  "deleted_at",
]);

function nextSlug(slug: string | null | undefined): string {
  const base = (slug || "copy").replace(/-copy(-\d+)?$/, "");
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-copy-${suffix}`;
}

export const cmsDuplicate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { entityKey: string; id: string }) => d)
  .handler(async ({ data, context }) => {
    const def = resolveEntity(data.entityKey);
    const supabase = (context as any).supabase as SupabaseAny;
    const actor = (context as any).userId as string | null;

    const { data: src, error: srcErr } = await supabase
      .from(def.table)
      .select("*")
      .eq(def.pkColumn ?? "id", data.id)
      .maybeSingle();
    if (srcErr) throw new Error(srcErr.message);
    if (!src) throw new Error("Source not found");

    const copy: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(src)) {
      if (!DUP_SKIP.has(k)) copy[k] = v;
    }
    if (def.slugColumn && typeof src[def.slugColumn] === "string") {
      copy[def.slugColumn] = nextSlug(src[def.slugColumn]);
    }
    // Reset lifecycle flags on the copy
    copy.workflow_state = "draft";
    if ("status" in src) copy.status = "draft";
    if ("is_pinned" in src) copy.is_pinned = false;
    if ("is_homepage_featured" in src) copy.is_homepage_featured = false;
    if ("name_ar" in src && typeof src.name_ar === "string")
      copy.name_ar = `${src.name_ar} (نسخة)`;
    if ("name_en" in src && typeof src.name_en === "string")
      copy.name_en = `${src.name_en} (Copy)`;

    const { data: row, error } = await supabase
      .from(def.table)
      .insert(copy as any)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await audit(supabase, actor, def.key, row.id, "duplicate", {
      source_id: data.id,
    });
    return row;
  });

/* -------------------------- REVISION HISTORY --------------------------- */

export const cmsListRevisions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { entityKey: string; id: string; limit?: number }) => d)
  .handler(async ({ data, context }) => {
    const def = resolveEntity(data.entityKey);
    const supabase = (context as any).supabase as SupabaseAny;
    const { data: rows, error } = await supabase
      .from("cms_revisions")
      .select("id, version_number, author_id, state, change_summary, created_at")
      .eq("entity_type", def.key)
      .eq("entity_id", data.id)
      .order("version_number", { ascending: false })
      .limit(data.limit ?? 50);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const cmsGetRevision = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { entityKey: string; id: string; version: number }) => d)
  .handler(async ({ data, context }) => {
    const def = resolveEntity(data.entityKey);
    const supabase = (context as any).supabase as SupabaseAny;
    const { data: row, error } = await supabase
      .from("cms_revisions")
      .select("*")
      .eq("entity_type", def.key)
      .eq("entity_id", data.id)
      .eq("version_number", data.version)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

const REV_RESTORE_SKIP = new Set([
  "id",
  "created_at",
  "updated_at",
  "views_count",
  "deleted_at",
]);

export const cmsRestoreRevision = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { entityKey: string; id: string; version: number }) => d)
  .handler(async ({ data, context }) => {
    const def = resolveEntity(data.entityKey);
    const supabase = (context as any).supabase as SupabaseAny;
    const actor = (context as any).userId as string | null;

    const { data: rev, error: revErr } = await supabase
      .from("cms_revisions")
      .select("snapshot")
      .eq("entity_type", def.key)
      .eq("entity_id", data.id)
      .eq("version_number", data.version)
      .maybeSingle();
    if (revErr) throw new Error(revErr.message);
    if (!rev?.snapshot) throw new Error("Revision not found");

    const snap = rev.snapshot as Record<string, unknown>;
    const patch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(snap)) {
      if (!REV_RESTORE_SKIP.has(k)) patch[k] = v;
    }
    const { error } = await supabase
      .from(def.table)
      .update(patch as any)
      .eq(def.pkColumn ?? "id", data.id);
    if (error) throw new Error(error.message);
    await audit(supabase, actor, def.key, data.id, "restore_revision", {
      version: data.version,
    });
    return { ok: true };
  });

/* ------------------------------- ACTIVITY ------------------------------- */

export const cmsListActivity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: { entityKey: string; id?: string; limit?: number }) => d,
  )
  .handler(async ({ data, context }) => {
    const def = resolveEntity(data.entityKey);
    const supabase = (context as any).supabase as SupabaseAny;
    let q = supabase
      .from("cms_events")
      .select("id, event_type, entity_type, entity_id, actor_id, payload, created_at")
      .eq("entity_type", def.key)
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 50);
    if (data.id) q = q.eq("entity_id", data.id);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

/* ------------------------------ DEPENDENCIES --------------------------- */

export const cmsListDependencies = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { entityKey: string; id: string }) => d)
  .handler(async ({ data, context }) => {
    const def = resolveEntity(data.entityKey);
    const supabase = (context as any).supabase as SupabaseAny;
    const [incoming, outgoing] = await Promise.all([
      supabase
        .from("cms_dependencies")
        .select("*")
        .eq("to_entity_type", def.key)
        .eq("to_entity_id", data.id),
      supabase
        .from("cms_dependencies")
        .select("*")
        .eq("from_entity_type", def.key)
        .eq("from_entity_id", data.id),
    ]);
    if (incoming.error) throw new Error(incoming.error.message);
    if (outgoing.error) throw new Error(outgoing.error.message);
    return {
      incoming: incoming.data ?? [],
      outgoing: outgoing.data ?? [],
    };
  });
