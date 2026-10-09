// AI translation Arabic → English with Claude, called straight from the browser
// using the owner's own API key (kept on this device only).
import { useSyncExternalStore } from "react";

const KEY = "yr_ai_key";
const ON = "yr_ai_auto";
const MODELS = ["claude-sonnet-5-5", "claude-haiku-5-5"];

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function read(k: string) {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
}
function write(k: string, v: string | null) {
  try {
    if (v === null) localStorage.removeItem(k);
    else localStorage.setItem(k, v);
  } catch {
    /* ignore */
  }
  emit();
}

export const ai = {
  key: () => read(KEY),
  setKey: (k: string | null) => write(KEY, k),
  auto: () => read(ON) !== "0",
  setAuto: (v: boolean) => write(ON, v ? "1" : "0"),
};

let snap = "";
function snapshot() {
  const s = `${ai.key() ? "1" : "0"}|${ai.auto() ? "1" : "0"}`;
  if (s !== snap) snap = s;
  return snap;
}
export function useAi() {
  const s = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    snapshot,
    () => "0|1",
  );
  const [hasKey, auto] = s.split("|");
  return { ready: hasKey === "1", auto: auto === "1" && hasKey === "1" };
}

const SYSTEM = `You translate website copy for "Youssef Rehab — YR Studio", a senior brand & visual identity designer serving Saudi Arabia, the UAE and the Gulf.
Translate the Arabic text the user sends into natural, polished, confident English that reads like it was written by a native copywriter for a premium design studio — not word for word.
Rules:
- Return ONLY the English translation. No quotes, no notes, no alternatives.
- Keep the same meaning, tone and roughly the same length. Short UI labels stay short (e.g. buttons, menu items).
- Keep line breaks, bullet characters, numbering, emojis and any HTML tags exactly as they are; translate only the text inside tags.
- Use Western digits (0-9). Keep brand names, client names, URLs and emails unchanged.
- Never add information that isn't in the source.`;

const cache = new Map<string, string>();

export async function translateArToEn(text: string, context?: string): Promise<string> {
  const src = text.trim();
  if (!src) return "";
  const ck = `${context ?? ""}::${src}`;
  if (cache.has(ck)) return cache.get(ck)!;
  const key = ai.key();
  if (!key) throw new Error("no-key");
  let lastErr: any = null;
  for (const model of MODELS) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model,
        max_tokens: Math.min(4000, 200 + src.length * 3),
        system: SYSTEM,
        messages: [{ role: "user", content: context ? `Where this appears on the site: ${context}\n\nArabic:\n${text}` : `Arabic:\n${text}` }],
      }),
    });
    if (res.ok) {
      const j = await res.json();
      const out = (j.content ?? []).map((c: any) => c.text ?? "").join("").trim();
      // keep the same leading/trailing line breaks as the source
      const result = out;
      cache.set(ck, result);
      return result;
    }
    let msg = res.statusText;
    try {
      msg = (await res.json())?.error?.message || msg;
    } catch {
      /* ignore */
    }
    lastErr = Object.assign(new Error(msg), { status: res.status });
    if (res.status === 401 || res.status === 403) break; // bad key — no point trying another model
  }
  throw lastErr ?? new Error("translate failed");
}

/** Quick check that a key works (one tiny request). */
export async function testKey(key: string): Promise<void> {
  const prev = ai.key();
  try {
    localStorage.setItem(KEY, key);
  } catch {
    /* ignore */
  }
  try {
    cache.clear();
    await translateArToEn("مرحبا");
  } finally {
    try {
      if (prev) localStorage.setItem(KEY, prev);
      else localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }
}
