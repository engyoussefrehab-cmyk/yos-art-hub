# Phase 1 — Foundations & Credibility

Scope-locked to Phase 1 only. Phases 2–4 remain paused until you explicitly approve them.

## What ships in Phase 1

Four workstreams, executed in order. Each is small, reviewable, and independent.

### 1. Accessibility baseline

- Associate every Contact form label with its input via `htmlFor` + matching `id` (name, email, subject, message, call_date, call_time, call_tz).
- Language welcome modal: trap focus while open, close on Escape, restore focus to the trigger on close.
- Add a "Skip to content" link as the first focusable element in the root shell; wrap page content in a single `<main id="main">` in `__root.tsx`.
- Respect `prefers-reduced-motion` on: testimonials marquee, WhatsApp fab ping, language modal enter animation, hero hover translates.
- Replace `min-h-screen` with `min-h-dvh` on the 404 and error boundary layouts.
- Add visible `focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2` on: header nav links, footer links, category cards, project cards, testimonial slider arrows, language switcher, theme toggle, hamburger.
- Verify `<html lang>` and `<html dir>` update on route change (AR ↔ EN); patch in root layout effect if missing.
- FAQ `<summary>`: add a visible chevron and `aria-expanded` cue via CSS.

Acceptance: keyboard tab order reveals a skip link first, all form fields announce their labels in a screen reader, no auto-motion runs when reduce-motion is set, `<main>` landmark present exactly once per page.

### 2. CTA discipline

- Hero: keep "Projects" as the single primary CTA; "Contact" becomes secondary outline; "Download portfolio PDF" demoted to a text link with icon (no button chrome).
- Header persistent CTA copy: change from "ابدأ مشروعك / Start a project" to a discovery-call framing (final AR/EN copy confirmed with you in the build turn — I'll propose two options).
- Bottom homepage CTA band: vary copy from the header CTA so the same words don't repeat three times on one page.
- Packages: pass the selected tier as a query param when the CTA routes to `/contact` (e.g. `?tier=signature`); Contact page prefills the Subject field from that param.

Acceptance: hero has one visually dominant CTA; the same button label never appears three times on the homepage; a click on a Packages tier arrives at Contact with the subject already filled.

### 3. Trust surface

- Add a client-logo strip on the homepage between About and Latest Projects. Grayscale, hover to color, respect reduced-motion. Content-managed via a new `home_logos` array in `site_settings` (JSONB) so you can edit from `/admin` without a migration schema change; falls back to a placeholder set until you upload real logos.
- Add a response-time promise + current availability line on the Contact page ("عادةً أرد خلال ٢٤ ساعة · Available for 2 projects this quarter") — text stored in `site_settings` so you can edit it.
- Add a small "Available for new projects" pill in the header (optional, toggle via `site_settings.availability_open` boolean; hidden when false).

Acceptance: logo strip renders on `/` and `/en`; Contact shows the promise line above the form; header pill appears only when the setting is on.

### 4. Contact form quality

- Split the form into two steps of the same page (no route change):
  1. Message step: name, email, subject, message, budget (select: <$500 / $500–1500 / $1500–3500 / $3500+ / prefer to discuss), project type (select: logo / brand identity / brand system / company profile / social / other).
  2. Optional "Prefer a call?" toggle reveals date/time/timezone.
- Add `autocomplete` hints (`name`, `email`, `off` on the honeypot).
- Inline validation on blur (not only on submit) for name and email.
- Replace the tiny success `<span>` with a proper thank-you panel that (a) confirms receipt, (b) states expected reply window, (c) offers WhatsApp as a fallback, (d) links back to Projects.
- Soften the spam-gate copy from accusation to "just a moment — please try again in a few seconds".
- Server route `/api/public/contact` accepts and forwards the new fields (budget, project_type) into the email body; Zod schema updated on both sides.

Acceptance: form fits above the fold on desktop; budget + type land in every email; a rapid re-submit shows a friendly message, not an error.

## Out of scope for Phase 1 (waiting on your approval)

- Nav IA changes, new About page, new Services page, split of Packages — Phase 2.
- Visual system pass, motion signature, photography — Phase 3.
- Cal.com embed, LCP preload, font trimming, per-route og:image, analytics — Phase 4.

## Technical notes

- All new copy is bilingual and added to `src/i18n/dictionary.ts`.
- `site_settings` gets three new optional keys (`home_logos: Array<{ src, alt_ar, alt_en, href? }>`, `contact_promise_ar/en`, `availability_open: boolean`) — read via existing `useCmsSettings` hook. No schema migration needed since the current settings table stores JSONB values; if the current shape doesn't support this, we'll fall back to a single JSONB `misc` column already present.
- No database migrations planned in Phase 1.
- No changes to routes, IA, or navigation structure in Phase 1.

## Deliverable order

1. A11y baseline (fastest, unlocks everything).
2. CTA discipline (small copy + layout changes).
3. Trust surface (adds logo strip + promise line).
4. Contact form quality (largest change, saved for last).

I'll test each workstream in the preview before moving to the next. After all four are green, I'll pause and hand back to you for the Phase 1 review.

## Two things I need from you inside the build turn

1. **Header CTA copy** — pick one:
   - AR "احجز مكالمة استكشاف" · EN "Book a discovery call"
   - AR "احجز جلسة مجانية" · EN "Free 20-min chat"
2. **Availability pill default** — start ON with "متاح لمشروعين هذا الربع / Available for 2 projects this quarter", or start OFF and you'll toggle it later from admin?

Approve to switch to build mode and I'll begin with the A11y baseline.
