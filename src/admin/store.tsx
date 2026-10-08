import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { commitChanges, deployStatus, headSha, readText, type DeployState, type FileChange } from "./github";
import { CONTENT_FILES } from "./schema";
import type { PreparedUpload } from "./images";

type Doc = { base: string; value: any };
type Store = {
  ready: boolean;
  loadError: string | null;
  docs: Record<string, Doc>;
  get: <T = any>(path: string) => T;
  set: (path: string, value: any) => void;
  isDirty: (path: string) => boolean;
  dirtyPaths: string[];
  uploads: PreparedUpload[];
  addUpload: (u: PreparedUpload) => void;
  previewFor: (url: string | null | undefined) => string | undefined;
  discard: (path?: string) => void;
  publish: (message: string) => Promise<string>;
  publishing: boolean;
  deploy: { sha: string; state: DeployState; startedAt: number } | null;
  reload: () => Promise<void>;
};

const Ctx = createContext<Store | null>(null);
const DRAFTS_KEY = "yr_admin_drafts_v1";

function readDrafts(): Record<string, any> {
  try {
    return JSON.parse(localStorage.getItem(DRAFTS_KEY) || "{}");
  } catch {
    return {};
  }
}
function writeDrafts(d: Record<string, any>) {
  try {
    if (Object.keys(d).length) localStorage.setItem(DRAFTS_KEY, JSON.stringify(d));
    else localStorage.removeItem(DRAFTS_KEY);
  } catch {
    /* storage full or unavailable — drafts stay in memory */
  }
}

const same = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);
export const serialize = (v: any) => JSON.stringify(v, null, 2) + "\n";

export function AdminStoreProvider({ children }: { children: ReactNode }) {
  const [docs, setDocs] = useState<Record<string, Doc>>({});
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [uploads, setUploads] = useState<PreparedUpload[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [deploy, setDeploy] = useState<Store["deploy"]>(null);
  const pollRef = useRef<number | null>(null);

  const load = useCallback(async () => {
    setReady(false);
    setLoadError(null);
    try {
      const sha = await headSha();
      const entries = await Promise.all(
        CONTENT_FILES.map(async (f) => {
          const text = await readText(f.path, sha);
          return [f.path, text] as const;
        }),
      );
      const drafts = readDrafts();
      const next: Record<string, Doc> = {};
      for (const [path, text] of entries) {
        const base = JSON.parse(text);
        next[path] = { base: text, value: path in drafts ? drafts[path] : base };
      }
      setDocs(next);
      setReady(true);
    } catch (e: any) {
      setLoadError(e?.message || String(e));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // keep drafts of unpublished edits in this browser
  useEffect(() => {
    if (!ready) return;
    const d: Record<string, any> = {};
    for (const [p, doc] of Object.entries(docs)) if (!same(doc.value, JSON.parse(doc.base))) d[p] = doc.value;
    writeDrafts(d);
  }, [docs, ready]);

  const get = useCallback(<T,>(path: string) => docs[path]?.value as T, [docs]);
  const set = useCallback((path: string, value: any) => {
    setDocs((prev) => ({ ...prev, [path]: { ...prev[path], value } }));
  }, []);
  const isDirty = useCallback(
    (path: string) => !!docs[path] && !same(docs[path].value, JSON.parse(docs[path].base)),
    [docs],
  );
  const dirtyPaths = useMemo(() => Object.keys(docs).filter((p) => isDirty(p)), [docs, isDirty]);

  const addUpload = useCallback((u: PreparedUpload) => setUploads((prev) => [...prev, u]), []);
  const previewFor = useCallback(
    (url: string | null | undefined) => {
      if (!url) return undefined;
      return uploads.find((u) => u.url === url)?.previewUrl ?? url;
    },
    [uploads],
  );

  const discard = useCallback((path?: string) => {
    setDocs((prev) => {
      const next = { ...prev };
      for (const p of path ? [path] : Object.keys(prev)) next[p] = { ...prev[p], value: JSON.parse(prev[p].base) };
      return next;
    });
    if (!path) setUploads([]);
  }, []);

  const watchDeploy = useCallback((sha: string) => {
    setDeploy({ sha, state: "queued", startedAt: Date.now() });
    if (pollRef.current) window.clearInterval(pollRef.current);
    pollRef.current = window.setInterval(async () => {
      const state = await deployStatus(sha);
      setDeploy((d) => (d && d.sha === sha ? { ...d, state } : d));
      if (state === "done" || state === "failed") {
        window.clearInterval(pollRef.current!);
        pollRef.current = null;
      }
    }, 6000);
  }, []);

  const publish = useCallback(
    async (message: string) => {
      setPublishing(true);
      try {
        // Refuse to overwrite a file someone changed elsewhere since we loaded it.
        const head = await headSha();
        const conflicts: string[] = [];
        await Promise.all(
          dirtyPaths.map(async (p) => {
            const remote = await readText(p, head);
            if (remote !== docs[p].base) conflicts.push(p);
          }),
        );
        if (conflicts.length) {
          const err: any = new Error("conflict");
          err.conflicts = conflicts;
          throw err;
        }
        // Only ship uploads that some content still references.
        const allText = dirtyPaths.map((p) => JSON.stringify(docs[p].value)).join("\n");
        const usedUploads = uploads.filter((u) => allText.includes(u.url));
        const changes: FileChange[] = [
          ...dirtyPaths.map((p) => ({ path: p, text: serialize(docs[p].value) })),
          ...usedUploads.flatMap((u) => u.files.map((f) => ({ path: f.path, bytes: f.bytes }))),
        ];
        if (!changes.length) throw new Error("nothing");
        const sha = await commitChanges(changes, message);
        setDocs((prev) => {
          const next = { ...prev };
          for (const p of dirtyPaths) next[p] = { base: serialize(prev[p].value), value: prev[p].value };
          return next;
        });
        setUploads((prev) => prev.filter((u) => !usedUploads.includes(u)));
        watchDeploy(sha);
        return sha;
      } finally {
        setPublishing(false);
      }
    },
    [dirtyPaths, docs, uploads, watchDeploy],
  );

  const value: Store = {
    ready,
    loadError,
    docs,
    get,
    set,
    isDirty,
    dirtyPaths,
    uploads,
    addUpload,
    previewFor,
    discard,
    publish,
    publishing,
    deploy,
    reload: load,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdmin() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAdmin outside provider");
  return v;
}
