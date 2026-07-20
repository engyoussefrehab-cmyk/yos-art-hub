/**
 * Event System — thin client + server surface over `cms_events`.
 *
 * Two layers:
 *   1. Database triggers emit durable events via `public.cms_emit_event(...)`.
 *      This covers workflow changes, lead creation, form submission, media
 *      deletion, etc. Guaranteed even for direct SQL writes.
 *   2. In-process pub/sub for admin UI subscribers (toast on publish,
 *      dependency-checker refresh, etc.). Not durable — for UI reactions.
 *
 * Automations / integrations poll or subscribe to `cms_events` server-side.
 */

export type CmsEventType =
  | "portfolio_project.created"
  | "portfolio_project.updated"
  | "portfolio_project.workflow_changed"
  | "portfolio_project.published"
  | "insight_article.created"
  | "insight_article.updated"
  | "insight_article.workflow_changed"
  | "insight_article.published"
  | "service.created"
  | "service.updated"
  | "service.workflow_changed"
  | "service.published"
  | "page.created"
  | "page.updated"
  | "page.published"
  | "lead.created"
  | "form.submitted"
  | "media.deleted"
  | (string & {});

export interface CmsEventEnvelope {
  type: CmsEventType;
  entityType?: string;
  entityId?: string;
  payload?: Record<string, unknown>;
  at: number;
}

type Handler = (e: CmsEventEnvelope) => void;

const subs = new Map<string, Set<Handler>>();

export function onEvent(type: CmsEventType | "*", handler: Handler): () => void {
  const key = String(type);
  let set = subs.get(key);
  if (!set) {
    set = new Set();
    subs.set(key, set);
  }
  set.add(handler);
  return () => set!.delete(handler);
}

export function emitEvent(env: Omit<CmsEventEnvelope, "at">): void {
  const full: CmsEventEnvelope = { ...env, at: Date.now() };
  subs.get(env.type)?.forEach((h) => {
    try {
      h(full);
    } catch (err) {
      console.error("[events] handler failed", env.type, err);
    }
  });
  subs.get("*")?.forEach((h) => {
    try {
      h(full);
    } catch (err) {
      console.error("[events] * handler failed", err);
    }
  });
}
