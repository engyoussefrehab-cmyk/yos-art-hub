/**
 * Generic editor view — driven by the entity registry. Fully bilingual.
 */

// Same rationale as GenericListView: guarantee entity registration
// regardless of which route pulls the editor in first.
import "@/admin/modules/register-all";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  cmsCreate,
  cmsGet,
  cmsUpdate,
  cmsSetWorkflow,
  cmsListRevisions,
  cmsRestoreRevision,
  cmsListActivity,
  cmsListDependencies,
} from "@/admin/lib/cms.functions";
import { getEntity, type EntityField, type WorkflowState } from "@/admin/lib/entity-registry";
import { GenericField } from "@/admin/lib/GenericField";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ArrowRight, ExternalLink, Save } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { A, useAdminLang, type L } from "@/i18n/admin-lang";

const WORKFLOW_STATES: WorkflowState[] = [
  "draft",
  "in_review",
  "approved",
  "published",
  "archived",
];

const WF_LABELS: Record<WorkflowState, L> = {
  draft: A.wf_draft,
  in_review: A.wf_in_review,
  approved: A.wf_approved,
  published: A.wf_published,
  archived: A.wf_archived,
};

const SEO_KEYS = new Set([
  "seo_title_ar",
  "seo_title_en",
  "seo_description_ar",
  "seo_description_en",
  "og_image_url",
  "seo_keywords",
]);

function normalizeJSON(v: unknown): unknown {
  if (typeof v !== "string") return v;
  const trimmed = v.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return v;
  }
}

export function GenericEditorView({
  entityKey,
  id,
  mode,
}: {
  entityKey: string;
  id?: string;
  mode: "create" | "edit";
}) {
  const def = getEntity(entityKey);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { t, isRTL } = useAdminLang();

  const getFn = useServerFn(cmsGet);
  const createFn = useServerFn(cmsCreate);
  const updateFn = useServerFn(cmsUpdate);
  const setWfFn = useServerFn(cmsSetWorkflow);
  const listRevFn = useServerFn(cmsListRevisions);
  const restoreRevFn = useServerFn(cmsRestoreRevision);
  const listActFn = useServerFn(cmsListActivity);
  const listDepFn = useServerFn(cmsListDependencies);

  const rowQ = useQuery({
    queryKey: ["cms-get", entityKey, id],
    enabled: mode === "edit" && !!id,
    queryFn: () => getFn({ data: { entityKey, id: id! } }),
  });

  const [values, setValues] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (mode === "edit" && rowQ.data) setValues(rowQ.data as Record<string, unknown>);
  }, [mode, rowQ.data]);

  const contentFields = useMemo(
    () => (def?.fields ?? []).filter((f) => !SEO_KEYS.has(f.key)),
    [def],
  );
  const seoFields = useMemo(
    () => (def?.fields ?? []).filter((f) => SEO_KEYS.has(f.key)),
    [def],
  );

  const save = useMutation({
    mutationFn: async () => {
      const clean: Record<string, unknown> = {};
      for (const f of def?.fields ?? []) {
        const v = values[f.key];
        if (v === undefined) continue;
        if (["json", "blocks", "multiselect", "media", "relation"].includes(f.kind)) {
          clean[f.key] = normalizeJSON(v);
        } else {
          clean[f.key] = v;
        }
      }
      if (mode === "create") {
        return createFn({ data: { entityKey, values: clean } });
      }
      return updateFn({ data: { entityKey, id: id!, values: clean } });
    },
    onSuccess: (row: { id?: string } | null) => {
      toast.success(mode === "create" ? t(A.created) : t(A.saved));
      qc.invalidateQueries({ queryKey: ["cms-list", entityKey] });
      qc.invalidateQueries({ queryKey: ["cms-get", entityKey] });
      if (mode === "create" && row?.id) {
        navigate({ to: "/admin/cms/$entity/$id", params: { entity: entityKey, id: row.id } });
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const changeWf = useMutation({
    mutationFn: (state: WorkflowState) =>
      setWfFn({ data: { entityKey, id: id!, state } }),
    onSuccess: () => {
      toast.success(t(A.workflow_updated));
      qc.invalidateQueries({ queryKey: ["cms-get", entityKey] });
      qc.invalidateQueries({ queryKey: ["cms-list", entityKey] });
      qc.invalidateQueries({ queryKey: ["cms-rev", entityKey] });
      qc.invalidateQueries({ queryKey: ["cms-act", entityKey] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const initialRef = useMemo(
    () => JSON.stringify(mode === "edit" ? (rowQ.data ?? null) : null),
    [mode, rowQ.data],
  );
  const isDirty =
    mode === "create"
      ? Object.keys(values).length > 0
      : rowQ.data
        ? JSON.stringify(values) !== initialRef
        : false;

  const [invalidKeys, setInvalidKeys] = useState<string[]>([]);

  const isEmpty = (v: unknown) =>
    v === undefined || v === null || (typeof v === "string" && v.trim() === "");

  const submit = () => {
    const missing = (def?.fields ?? [])
      .filter((f) => f.required && isEmpty(values[f.key]))
      .map((f) => f.key);
    setInvalidKeys(missing);
    if (missing.length > 0) {
      toast.error(t(A.required_missing));
      return;
    }
    save.mutate();
  };

  // ⌘/Ctrl + S saves.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        submit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  if (!def) {
    return (
      <div className="p-6 text-destructive">
        {t(A.unknown_entity)} “{entityKey}”.
      </div>
    );
  }

  const wfState = (values.workflow_state as WorkflowState) ?? "draft";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const title = String(values.name_ar ?? values.name_en ?? values.title_ar ?? values.title_en ?? "");
  const setField = (k: string, v: unknown) => {
    setInvalidKeys((s) => (s.includes(k) ? s.filter((x) => x !== k) : s));
    setValues((s) => ({ ...s, [k]: v }));
  };

  return (
    <div className="flex flex-col gap-5 p-4 pb-24 md:p-6">
      <header className="sticky top-0 z-20 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b bg-background/85 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin/cms/$entity" params={{ entity: entityKey }}>
              <BackIcon className="me-1 h-3.5 w-3.5" /> {t(A.back)}
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold md:text-lg">
              {mode === "create"
                ? `${t(A.new_prefix)} ${t(def.label)}`
                : title || `${t(A.edit_record)} — ${t(def.label)}`}
            </h1>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              {mode === "edit" && <span className="truncate">{String(values.slug ?? id)}</span>}
              {mode === "edit" && (
                <span className="rounded-full border px-2 py-0.5">{t(WF_LABELS[wfState])}</span>
              )}
              {isDirty && (
                <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {t(A.unsaved_changes)}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {mode === "edit" && def.previewPathTemplate && values.slug ? (
            <Button asChild variant="outline" size="sm">
              <a
                href={def.previewPathTemplate
                  .replace("{slug}", String(values.slug ?? ""))
                  .replace("{category_slug}", String(values.category_slug ?? "all"))}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink className="me-1 h-3.5 w-3.5" /> {t(A.view)}
              </a>
            </Button>
          ) : null}
          <Button size="sm" onClick={submit} disabled={save.isPending}>
            <Save className="me-1 h-3.5 w-3.5" />
            {save.isPending ? t(A.saving) : t(A.save)}
          </Button>
        </div>
      </header>

      {mode === "edit" && rowQ.isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-md bg-muted" />
          ))}
        </div>
      ) : (
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="flex w-full flex-wrap justify-start">
            <TabsTrigger value="content">{t(A.tab_content)}</TabsTrigger>
            <TabsTrigger value="seo">{t(A.tab_seo)}</TabsTrigger>
            <TabsTrigger value="workflow" disabled={mode === "create"}>
              {t(A.tab_workflow)}
            </TabsTrigger>
            <TabsTrigger value="history" disabled={mode === "create"}>
              {t(A.tab_history)}
            </TabsTrigger>
            <TabsTrigger value="activity" disabled={mode === "create"}>
              {t(A.tab_activity)}
            </TabsTrigger>
            <TabsTrigger value="deps" disabled={mode === "create"}>
              {t(A.tab_deps)}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="mt-4">
            <GroupedFields fields={contentFields} values={values} invalidKeys={invalidKeys} onChange={setField} />
          </TabsContent>

          <TabsContent value="seo" className="mt-4">
            <GroupedFields fields={seoFields} values={values} invalidKeys={invalidKeys} onChange={setField} />
          </TabsContent>

          <TabsContent value="workflow" className="mt-4">
            <div className="rounded-lg border bg-card p-4">
              <div className="mb-3 text-sm font-medium">{t(A.wf_current_state)}</div>
              <div className="flex flex-wrap items-center gap-3">
                <Select
                  value={wfState}
                  onValueChange={(v) => changeWf.mutate(v as WorkflowState)}
                  disabled={changeWf.isPending}
                >
                  <SelectTrigger className="h-9 w-56">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WORKFLOW_STATES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {t(WF_LABELS[s])}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t(A.wf_publish_note)}<code>published_at</code>{t(A.wf_publish_note_2)}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            {mode === "edit" && id && (
              <HistoryPanel
                entityKey={entityKey}
                id={id}
                listFn={listRevFn as never}
                restoreFn={restoreRevFn as never}
              />
            )}
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            {mode === "edit" && id && (
              <ActivityPanel entityKey={entityKey} id={id} listFn={listActFn as never} />
            )}
          </TabsContent>

          <TabsContent value="deps" className="mt-4">
            {mode === "edit" && id && (
              <DepsPanel entityKey={entityKey} id={id} listFn={listDepFn as never} />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

/* ---------------------------- sub-components --------------------------- */

function GroupedFields({
  fields,
  values,
  invalidKeys,
  onChange,
}: {
  fields: EntityField[];
  values: Record<string, unknown>;
  invalidKeys: string[];
  onChange: (k: string, v: unknown) => void;
}) {
  const { t } = useAdminLang();
  const groups = useMemo(() => {
    const out: Array<{ title: string; fields: EntityField[] }> = [];
    for (const f of fields) {
      const title = f.group ? t(f.group) : t(A.group_general);
      const last = out[out.length - 1];
      if (last && last.title === title) last.fields.push(f);
      else out.push({ title, fields: [f] });
    }
    return out;
  }, [fields, t]);

  return (
    <div className="flex flex-col gap-5">
      {groups.map((g) => (
        <section key={g.title} className="rounded-lg border bg-card">
          <div className="border-b px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {g.title}
          </div>
          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
            {g.fields.map((f) => (
              <div
                key={f.key}
                className={[
                  f.fullWidth ||
                  ["textarea", "richtext", "json", "blocks", "gallery", "multiselect", "relation"].includes(f.kind)
                    ? "md:col-span-2"
                    : "",
                  invalidKeys.includes(f.key)
                    ? "rounded-md ring-1 ring-destructive/60 p-2 -m-2"
                    : "",
                ].join(" ")}
              >
                <GenericField
                  field={f}
                  value={values[f.key]}
                  onChange={(v) => onChange(f.key, v)}
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function HistoryPanel({
  entityKey,
  id,
  listFn,
  restoreFn,
}: {
  entityKey: string;
  id: string;
  listFn: (v: { data: { entityKey: string; id: string } }) => Promise<unknown>;
  restoreFn: (v: { data: { entityKey: string; id: string; version: number } }) => Promise<unknown>;
}) {
  const qc = useQueryClient();
  const { t } = useAdminLang();
  const q = useQuery({
    queryKey: ["cms-rev", entityKey, id],
    queryFn: () => listFn({ data: { entityKey, id } }),
  });
  const restore = useMutation({
    mutationFn: (version: number) => restoreFn({ data: { entityKey, id, version } }),
    onSuccess: () => {
      toast.success(t(A.revision_restored));
      qc.invalidateQueries({ queryKey: ["cms-get", entityKey] });
      qc.invalidateQueries({ queryKey: ["cms-rev", entityKey] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const rows = (q.data ?? []) as Array<{ id: string; version_number: number; state: string; created_at: string }>;
  return (
    <div className="rounded-md border">
      <div className="divide-y">
        {q.isLoading ? (
          <div className="p-4 text-xs text-muted-foreground">{t(A.loading)}</div>
        ) : rows.length === 0 ? (
          <div className="p-4 text-xs text-muted-foreground">{t(A.no_revisions)}</div>
        ) : (
          rows.map((r) => (
            <div key={r.id} className="flex items-center justify-between px-4 py-2 text-sm">
              <div>
                <div className="font-medium">v{r.version_number} · {r.state}</div>
                <div className="text-[11px] text-muted-foreground">
                  {new Date(r.created_at).toLocaleString()}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (confirm(t(A.confirm_restore_rev))) restore.mutate(r.version_number);
                }}
              >
                {t(A.restore)}
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ActivityPanel({
  entityKey,
  id,
  listFn,
}: {
  entityKey: string;
  id: string;
  listFn: (v: { data: { entityKey: string; id: string } }) => Promise<unknown>;
}) {
  const { t } = useAdminLang();
  const q = useQuery({
    queryKey: ["cms-act", entityKey, id],
    queryFn: () => listFn({ data: { entityKey, id } }),
  });
  const rows = (q.data ?? []) as Array<{ id: string; event_type: string; created_at: string; payload?: Record<string, unknown> }>;
  return (
    <div className="rounded-md border">
      <div className="divide-y">
        {q.isLoading ? (
          <div className="p-4 text-xs text-muted-foreground">{t(A.loading)}</div>
        ) : rows.length === 0 ? (
          <div className="p-4 text-xs text-muted-foreground">{t(A.no_activity)}</div>
        ) : (
          rows.map((r) => (
            <div key={r.id} className="px-4 py-2 text-sm">
              <div className="font-medium">{r.event_type}</div>
              <div className="text-[11px] text-muted-foreground">
                {new Date(r.created_at).toLocaleString()}
                {r.payload && Object.keys(r.payload).length > 0
                  ? ` · ${JSON.stringify(r.payload)}`
                  : ""}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function DepsPanel({
  entityKey,
  id,
  listFn,
}: {
  entityKey: string;
  id: string;
  listFn: (v: { data: { entityKey: string; id: string } }) => Promise<unknown>;
}) {
  const { t } = useAdminLang();
  const q = useQuery({
    queryKey: ["cms-deps", entityKey, id],
    queryFn: () => listFn({ data: { entityKey, id } }),
  });
  const data = (q.data ?? {}) as { incoming?: unknown[]; outgoing?: unknown[] };
  const incoming = (data.incoming ?? []) as Array<Record<string, unknown> & { id: string }>;
  const outgoing = (data.outgoing ?? []) as Array<Record<string, unknown> & { id: string }>;
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <DepList title={t(A.deps_incoming)} rows={incoming} />
      <DepList title={t(A.deps_outgoing)} rows={outgoing} />
    </div>
  );
}

function DepList({
  title,
  rows,
}: {
  title: string;
  rows: Array<Record<string, unknown> & { id: string }>;
}) {
  const { t } = useAdminLang();
  return (
    <div className="rounded-md border">
      <div className="border-b px-3 py-2 text-xs font-medium">{title}</div>
      <div className="divide-y">
        {rows.length === 0 ? (
          <div className="p-3 text-xs text-muted-foreground">{t(A.none)}</div>
        ) : (
          rows.map((r) => (
            <div key={r.id} className="px-3 py-2 text-xs">
              <div className="font-medium">
                {String(r.from_entity_type)} → {String(r.to_entity_type)}
              </div>
              <div className="text-muted-foreground">
                {String(r.kind ?? "")}
                {r.from_field ? ` · ${String(r.from_field)}` : ""}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
