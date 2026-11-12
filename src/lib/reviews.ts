import { OS_SUPABASE_ANON_KEY, OS_SUPABASE_URL } from "@/lib/site";

export type LiveReview = { name: string; project: string; quote: string; rating: number };

const headers = {
  "Content-Type": "application/json",
  apikey: OS_SUPABASE_ANON_KEY,
  Authorization: `Bearer ${OS_SUPABASE_ANON_KEY}`,
};

/** Reviews clients submitted through /review (empty list if the backend is unreachable). */
export async function fetchLiveReviews(): Promise<LiveReview[]> {
  try {
    const r = await fetch(`${OS_SUPABASE_URL}/rest/v1/rpc/public_reviews`, {
      method: "POST",
      headers,
      body: "{}",
    });
    if (!r.ok) return [];
    const rows = (await r.json()) as { name: string; project: string | null; text: string; rating: number }[];
    return rows.map((x) => ({ name: x.name, project: x.project ?? "", quote: x.text, rating: x.rating }));
  } catch {
    return [];
  }
}

export async function submitReview(payload: Record<string, unknown>): Promise<void> {
  const r = await fetch(`${OS_SUPABASE_URL}/rest/v1/rpc/submit_review`, {
    method: "POST",
    headers,
    body: JSON.stringify({ payload }),
  });
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    throw new Error(String(j.message || r.status));
  }
}
