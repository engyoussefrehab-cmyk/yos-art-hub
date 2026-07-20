/**
 * Generic list view — driven entirely by the entity registry.
 *
 * Provides: search, workflow filter, archived/deleted toggles, pagination,
 * and row actions (Edit, Duplicate, Archive/Unarchive, Delete/Restore).
 * Every visible string is resolved through the admin i18n dictionary.
 */

// Ensure all entities/modules are registered before this view resolves them.
// Route load order isn't guaranteed to hit AdminShell first, so import the
// bootstrap module directly for its side effects.
import "@/admin/modules/register-all";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  cmsList,
  cmsSoftDelete,
  cmsRestore,
  cmsArchive,
  cmsUnarchive,
  cmsDuplicate,
} from "@/admin/lib/cms.functions";
import { getEntity, type WorkflowState } from "@/admin/lib/entity-registry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Archive,
  ArchiveRestore,
  Copy,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Trash2,
  Undo2,
} from "lucide-react";
import { A, useAdminLang, type L } from "@/i18n/admin-lang";

const WORKFLOW_STATES: (WorkflowState | "any")[] = [
  "any",
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

function WorkflowBadge({ state }: { state: string }) {
  const { t } = useAdminLang();
  const tone: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    in_review: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
    approved: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200",
    published: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
    archived: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  };
  const wf = WF_LABELS[state as WorkflowState];
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${tone[state] ?? "bg-muted"}`}>
      {wf ? t(wf) : state}
    </span>
  );
}

export function GenericListView({ entityKey }: { entityKey: string }) {
  const def = getEntity(entityKey);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { t } = useAdminLang();

  const [search, setSearch] = useState("");
  const [state, setState] = useState<WorkflowState | "any">("any");
  const [includeArchived, setIncludeArchived] = useState(false);
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const listFn = useServerFn(cmsList);
  const deleteFn = useServerFn(cmsSoftDelete);
  const restoreFn = useServerFn(cmsRestore);
  const archiveFn = useServerFn(cmsArchive);
  const unarchiveFn = useServerFn(cmsUnarchive);
  const duplicateFn = useServerFn(cmsDuplicate);

  const queryKey = useMemo(
    () => ["cms-list", entityKey, { search, state, includeArchived, includeDeleted, page }] as const,
    [entityKey, search, state, includeArchived, includeDeleted, page],
  );

  const q = useQuery({
    queryKey,
    queryFn: () =>
      listFn({
        data: {
          entityKey,
          search,
          workflowState: state,
          includeArchived,
          includeDeleted,
          page,
          pageSize,
        },
      }),
    placeholderData: (prev) => prev,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["cms-list", entityKey] });

  const useRowMutation = (
    fn: (v: { data: { entityKey: string; id: string } }) => Promise<unknown>,
    successMsg: string,
  ) =>
    useMutation({
      mutationFn: (id: string) => fn({ data: { entityKey, id } }),
      onSuccess: () => {
        toast.success(successMsg);
        invalidate();
      },
      onError: (e: Error) => toast.error(`${t(A.op_failed)}: ${e.message}`),
    });

  const del = useRowMutation(deleteFn as never, t(A.deleted));
  const rest = useRowMutation(restoreFn as never, t(A.restored));
  const arc = useRowMutation(archiveFn as never, t(A.archived));
  const unarc = useRowMutation(unarchiveFn as never, t(A.unarchived));
  const dup = useMutation({
    mutationFn: (id: string) => duplicateFn({ data: { entityKey, id } }),
    onSuccess: (row: { id?: string } | null) => {
      toast.success(t(A.duplicated));
      invalidate();
      if (row?.id) navigate({ to: "/admin/cms/$entity/$id", params: { entity: entityKey, id: row.id } });
    },
    onError: (e: Error) => toast.error(`${t(A.op_failed)}: ${e.message}`),
  });

  if (!def) {
    return (
      <div className="p-6 text-sm text-destructive">
        {t(A.unknown_entity)} “{entityKey}”. {t(A.register_via)} <code>registerEntity()</code>.
      </div>
    );
  }

  const total = q.data?.total ?? 0;
  const rows = (q.data?.rows ?? []) as Array<Record<string, unknown> & { id: string }>;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const pageIndicator = t(A.page_of)
    .replace("{n}", String(page))
    .replace("{t}", String(totalPages));

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{t(def.labelPlural)}</h1>
          <p className="text-xs text-muted-foreground">
            {total} {total === 1 ? t(A.records_singular) : t(A.records_plural)} · {t(A.engine_note)}
          </p>
        </div>
        <Button asChild size="sm">
          <Link to="/admin/cms/$entity/new" params={{ entity: entityKey }}>
            <Plus className="me-1 h-3.5 w-3.5" /> {t(A.new_prefix)} {t(def.label)}
          </Link>
        </Button>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder={t(A.search_records_ph)}
          className="h-9 w-64"
        />
        <Select
          value={state}
          onValueChange={(v: WorkflowState | "any") => {
            setState(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-9 w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WORKFLOW_STATES.map((s) => (
              <SelectItem key={s} value={s}>
                {s === "any" ? t(A.any_state) : t(WF_LABELS[s as WorkflowState])}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant={includeArchived ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setIncludeArchived((v) => !v);
            setPage(1);
          }}
        >
          {t(A.include_archived)}
        </Button>
        <Button
          variant={includeDeleted ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setIncludeDeleted((v) => !v);
            setPage(1);
          }}
        >
          {t(A.include_trash)}
        </Button>
        <Button variant="ghost" size="icon" onClick={() => q.refetch()} title={t(A.refresh)}>
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {def.listColumns.map((c) => (
                <TableHead key={c.key} style={{ width: c.width }}>
                  {t(c.label)}
                </TableHead>
              ))}
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {q.isLoading ? (
              <TableRow>
                <TableCell colSpan={def.listColumns.length + 1} className="py-8 text-center text-xs text-muted-foreground">
                  {t(A.loading)}
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={def.listColumns.length + 1} className="py-8 text-center text-xs text-muted-foreground">
                  {t(A.no_records)}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={row.deleted_at ? "opacity-60" : undefined}
                >
                  {def.listColumns.map((c) => {
                    const raw = row[c.key];
                    let cell: React.ReactNode = (raw as React.ReactNode) ?? "—";
                    if (c.render === "date" && raw) {
                      cell = new Date(raw as string).toLocaleString();
                    } else if (c.render === "workflow") {
                      cell = <WorkflowBadge state={String(raw ?? "draft")} />;
                    } else if (c.render === "badge") {
                      cell = <Badge variant="outline">{String(raw ?? "")}</Badge>;
                    } else if (c.key === (def.slugColumn ?? "slug") || c.key === "name_en" || c.key === "name_ar" || c.key === "title_en" || c.key === "title_ar") {
                      cell = (
                        <Link
                          to="/admin/cms/$entity/$id"
                          params={{ entity: entityKey, id: row.id }}
                          className="font-medium hover:underline"
                        >
                          {String(raw ?? "—")}
                        </Link>
                      );
                    }
                    return <TableCell key={c.key}>{cell}</TableCell>;
                  })}
                  <TableCell className="text-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => dup.mutate(row.id)}>
                          <Copy className="me-2 h-3.5 w-3.5" /> {t(A.duplicate)}
                        </DropdownMenuItem>
                        {row.workflow_state === "archived" ? (
                          <DropdownMenuItem onClick={() => unarc.mutate(row.id)}>
                            <ArchiveRestore className="me-2 h-3.5 w-3.5" /> {t(A.unarchive)}
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => arc.mutate(row.id)}>
                            <Archive className="me-2 h-3.5 w-3.5" /> {t(A.archive)}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {row.deleted_at ? (
                          <DropdownMenuItem onClick={() => rest.mutate(row.id)}>
                            <Undo2 className="me-2 h-3.5 w-3.5" /> {t(A.restore)}
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              if (confirm(t(A.confirm_trash))) del.mutate(row.id);
                            }}
                          >
                            <Trash2 className="me-2 h-3.5 w-3.5" /> {t(A.delete)}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{pageIndicator}</span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            {t(A.prev)}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            {t(A.next)}
          </Button>
        </div>
      </div>
    </div>
  );
}
