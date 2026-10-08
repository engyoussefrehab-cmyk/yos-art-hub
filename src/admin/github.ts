// Talks to GitHub straight from the browser with the owner's personal access
// token. Reads content files, commits all pending changes as ONE commit, and
// follows the deploy that the commit triggers.

export const REPO = { owner: "engyoussefrehab-cmyk", name: "yos-art-hub", branch: "main" };
const API = "https://api.github.com";
const TOKEN_KEY = "yr_admin_token";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}
export function setToken(t: string | null) {
  try {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export class GitHubError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function gh<T = any>(path: string, init: RequestInit = {}, token = getToken()): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    let msg = res.statusText;
    try {
      msg = (await res.json()).message || msg;
    } catch {
      /* ignore */
    }
    throw new GitHubError(msg, res.status);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

const repoPath = `/repos/${REPO.owner}/${REPO.name}`;

/** Checks the token can write to the site repo. Returns the GitHub login. */
export async function verifyToken(token: string): Promise<string> {
  const user = await gh<{ login: string }>("/user", {}, token);
  const repo = await gh<{ permissions?: { push?: boolean } }>(repoPath, {}, token);
  if (repo.permissions && repo.permissions.push === false) {
    throw new GitHubError("no-write", 403);
  }
  return user.login;
}

function b64ToUtf8(b64: string): string {
  const bin = atob(b64.replace(/\n/g, ""));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
function bytesToB64(bytes: Uint8Array): string {
  let s = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) s += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(s);
}

/** Latest commit sha on the branch. */
export async function headSha(): Promise<string> {
  const ref = await gh<{ object: { sha: string } }>(`${repoPath}/git/ref/heads/${REPO.branch}`);
  return ref.object.sha;
}

/** Reads a text file at a given commit (or the branch head). Works for files of any size. */
export async function readText(path: string, ref?: string): Promise<string> {
  const r = ref ?? REPO.branch;
  const meta = await gh<{ content?: string; encoding?: string; sha: string; size: number }>(
    `${repoPath}/contents/${encodeURI(path)}?ref=${r}`,
  );
  if (meta.content && meta.encoding === "base64") return b64ToUtf8(meta.content);
  const blob = await gh<{ content: string }>(`${repoPath}/git/blobs/${meta.sha}`);
  return b64ToUtf8(blob.content);
}

export async function listDir(path: string): Promise<{ name: string; path: string; size: number; type: string }[]> {
  try {
    return await gh(`${repoPath}/contents/${encodeURI(path)}?ref=${REPO.branch}`);
  } catch (e) {
    if (e instanceof GitHubError && e.status === 404) return [];
    throw e;
  }
}

/** Every image/file under public/ (except social-share twins), for the media library. */
export async function listMedia(): Promise<{ url: string; size: number }[]> {
  const sha = await headSha();
  const tree = await gh<{ tree: { path: string; type: string; size?: number }[] }>(
    `${repoPath}/git/trees/${sha}?recursive=1`,
  );
  return tree.tree
    .filter(
      (t) =>
        t.type === "blob" &&
        t.path.startsWith("public/") &&
        !t.path.startsWith("public/media/share/") &&
        /\.(webp|png|jpe?g|gif|svg|avif|pdf)$/i.test(t.path),
    )
    .map((t) => ({ url: t.path.replace(/^public/, ""), size: t.size ?? 0 }));
}

export type FileChange ={ path: string; text?: string; bytes?: Uint8Array; delete?: boolean };

/**
 * Commits every change in one commit on top of the current branch head.
 * Retries on a race with another commit (each change replaces whole files).
 */
export async function commitChanges(changes: FileChange[], message: string): Promise<string> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const parent = await headSha();
    const parentCommit = await gh<{ tree: { sha: string } }>(`${repoPath}/git/commits/${parent}`);
    const tree = await Promise.all(
      changes.map(async (c) => {
        if (c.delete) return { path: c.path, mode: "100644", type: "blob", sha: null };
        const content = c.bytes ? bytesToB64(c.bytes) : bytesToB64(new TextEncoder().encode(c.text ?? ""));
        const blob = await gh<{ sha: string }>(`${repoPath}/git/blobs`, {
          method: "POST",
          body: JSON.stringify({ content, encoding: "base64" }),
        });
        return { path: c.path, mode: "100644", type: "blob", sha: blob.sha };
      }),
    );
    const newTree = await gh<{ sha: string }>(`${repoPath}/git/trees`, {
      method: "POST",
      body: JSON.stringify({ base_tree: parentCommit.tree.sha, tree }),
    });
    const commit = await gh<{ sha: string }>(`${repoPath}/git/commits`, {
      method: "POST",
      body: JSON.stringify({ message, tree: newTree.sha, parents: [parent] }),
    });
    try {
      await gh(`${repoPath}/git/refs/heads/${REPO.branch}`, {
        method: "PATCH",
        body: JSON.stringify({ sha: commit.sha, force: false }),
      });
      return commit.sha;
    } catch (e) {
      if (e instanceof GitHubError && (e.status === 422 || e.status === 409) && attempt < 2) continue;
      throw e;
    }
  }
  throw new GitHubError("conflict", 409);
}

export type DeployState = "queued" | "building" | "done" | "failed" | "unknown";

/** Status of the deploy workflow run for a commit. */
export async function deployStatus(sha: string): Promise<DeployState> {
  try {
    const runs = await gh<{ workflow_runs: { status: string; conclusion: string | null }[] }>(
      `${repoPath}/actions/runs?head_sha=${sha}&per_page=5`,
    );
    const run = runs.workflow_runs[0];
    if (!run) return "queued";
    if (run.status !== "completed") return run.status === "in_progress" ? "building" : "queued";
    return run.conclusion === "success" ? "done" : "failed";
  } catch {
    return "unknown";
  }
}

/** Recent commits made to the site (for the history panel). */
export async function recentCommits(n = 15): Promise<{ sha: string; message: string; date: string }[]> {
  const list = await gh<{ sha: string; commit: { message: string; author: { date: string } } }[]>(
    `${repoPath}/commits?sha=${REPO.branch}&per_page=${n}`,
  );
  return list.map((c) => ({ sha: c.sha, message: c.commit.message.split("\n")[0], date: c.commit.author.date }));
}
