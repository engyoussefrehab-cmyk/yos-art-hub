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

  if (!def) {
    return (
      <div className="p-6 text-destructive">
        {t(A.unknown_entity)} “{entityKey}”.
      </div>
    );
  }

  const wfState = (values.workflow_state as WorkflowState) ?? "draft";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin/cms/$entity" params={{ entity: entityKey }}>
              <BackIcon className="me-1 h-3.5 w-3.5" /> {t(A.back)}
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-semibold">
              {mode === "create"
                ? `${t(A.new_prefix)} ${t(def.label)}`
                : `${t(A.edit_record)} — ${t(def.label)}`}
            </h1>
            {mode === "edit" && (
              <p className="text-xs text-muted-foreground">
                {String(values.slug ?? id)}
              </p>
            )}
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
          <Button size="sm" onClick={() => save.mutate()} disabled={save.isPending}>
            <Save className="me-1 h-3.5 w-3.5" />
            {save.isPending ? t(A.saving) : t(A.save)}
          </Button>
        </div>
      </header>

      <Tabs defaultValue="content" className="w-full">
        <TabsList>
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

        <TabsContent value="content">
          <FieldGrid
            fields={contentFields}
            values={values}
            onChange={(k, v) => setValues((s) => ({ ...s, [k]: v }))}
          />
        </TabsContent>

        <TabsContent value="seo">
          <FieldGrid
            fields={seoFields}
            values={values}
            onChange={(k, v) => setValues((s) => ({ ...s, [k]: v }))}
          />
        </TabsContent>

        <TabsContent value="workflow">
          <div className="rounded-md border p-4">
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

        <TabsContent value="history">
          {mode === "edit" && id && (
            <HistoryPanel
              entityKey={entityKey}
              id={id}
              listFn={listRevFn as never}
              restoreFn={restoreRevFn as never}
            />
          )}
        </TabsContent>

        <TabsContent value="activity">
          {mode === "edit" && id && (
            <ActivityPanel entityKey={entityKey} id={id} listFn={listActFn as never} />
          )}
        </TabsContent>

        <TabsContent value="deps">
          {mode === "edit" && id && (
            <DepsPanel entityKey={entityKey} id={id} listFn={listDepFn as never} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ---------------------------- sub-components --------------------------- */

function FieldGrid({
  fields,
  values,
  onChange,
}: {
  fields: EntityField[];
  values: Record<string, unknown>;
  onChange: (k: string, v: unknown) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {fields.map((f) => (
        <div
          key={f.key}
          className={
            f.kind === "textarea" || f.kind === "json" || f.kind === "blocks"
              ? "md:col-span-2"
              : undefined
          }
        >
          <GenericField
            field={f}
            value={values[f.key]}
            onChange={(v) => onChange(f.key, v)}
          />
        </div>
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
