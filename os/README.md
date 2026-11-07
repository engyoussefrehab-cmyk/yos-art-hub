# YR Studio OS

A private business app for YR Studio: leads, clients, quotations (with a branded PDF), projects, payments, follow-ups, message templates, a dashboard, and a public inquiry form. One owner, dark UI using the real YR Studio brand. It runs entirely on free plans.

## Stack

| Part | Choice | Why |
|---|---|---|
| App | React + Vite + Tailwind (static files) | One small frontend, no server to maintain |
| Database, sign-in, security | Supabase (Postgres + Auth + Row Level Security) | Managed, free tier, secure sign-in out of the box |
| Hosting | Cloudflare Pages | Free, commercial use allowed, custom domain, auto-deploy from GitHub |
| Automations | Postgres triggers / functions | No extra service: they run inside the database |
| PDF | Browser "Print → Save as PDF" on a print-designed page | No paid PDF API, no extra library |

There are only 4 runtime dependencies (`react`, `react-dom`, `react-router-dom`, `@supabase/supabase-js`).

## Free-tier limits (checked 7 Nov 2026, official pricing pages)

**Supabase Free** ([pricing](https://supabase.com/pricing)):
- 500 MB database. At 20 inquiries/day, that is many years of text data.
- 50,000 monthly active users and 5 GB egress. One owner uses a tiny fraction of this.
- 2 active projects.
- The project **pauses after 1 week with no activity**. Daily use, or any form submission, keeps it awake. If it pauses, click *Restore* in the Supabase dashboard. That is free and the data is kept.
- **No automatic backups on Free.** Use *Settings → Download full backup* weekly (see below).
- The pricing page does not say anything about commercial use on Free. I found no restriction, but check Supabase's terms if this matters to you.

**Cloudflare Pages Free** ([limits](https://developers.cloudflare.com/pages/platform/limits/)): 500 builds per month, 100 custom domains per project, 20,000 files per site. No bandwidth limit is listed.

Nothing in this app needs a paid plan, a paid API, or billing.

## What happens automatically

- **Inquiry form submitted:** the client is created (or reused if the email or phone already exists), a lead is saved with status *New Inquiry*, and a *Reply today* follow-up is added.
- **Lead given a "Next follow-up" date:** one reminder is created and kept in sync with that date.
- **Quotation marked Sent:** the lead moves to *Quotation Sent* and a follow-up is added for 3 days later.
- **Quotation marked Accepted:** a project is created once, with the quotation total as its budget. The lead becomes *Won* and the quotation's follow-ups are closed.
- **Quotation marked Rejected:** the lead becomes *Lost*.
- Reference numbers are generated automatically: `L-0001`, `Q-0001`, `P-0001`.

Nothing is ever sent to clients automatically. You send messages yourself; the Templates page fills them in and opens WhatsApp.

## Setup (one time, about 15 minutes)

### 1. Supabase project
1. Create a free account at supabase.com, then **New project** (choose the region closest to you, e.g. Frankfurt).
2. **SQL Editor:** paste and run `supabase/migrations/20261107000001_init.sql`, then `20261107000002_backup.sql`, in that order.
3. **Authentication → Sign In / Providers:** turn **off** "Allow new users to sign up".
4. **Authentication → Users → Add user:** enter your email and a strong password, and tick *Auto confirm*. **The first user created becomes the owner.**
   - If you created the user before running the SQL, run this once: `insert into owners select id from auth.users where email = 'you@example.com';`
5. **Authentication → URL Configuration:** set Site URL to `https://os.yrstudio.art` (or the `*.pages.dev` URL until the domain is connected).
6. **Project Settings → API:** copy the **Project URL** and the **anon / publishable key**. Both are safe to use in the browser, because the security rules decide what each key can do. **Never** put the `service_role` or secret key in the app.

### 2. Run locally (optional)
```bash
cd os
```
```bash
bun install
```
```bash
cp .env.example .env.local   # then paste the URL and anon key
```
```bash
bun run dev                  # http://127.0.0.1:5190
```

### 3. Hosting (live)
The app runs on **Cloudflare Workers (static assets, free)**:
**https://yr-studio-os.eng-youssefrehab.workers.dev**

- It is connected to this GitHub repo. Every push to `main` that changes `os/` rebuilds and publishes the app automatically.
- Build settings in Cloudflare: Root directory `os`, Build command `npm install && npm run build`, Deploy command `npx wrangler deploy`. The routing config is in `wrangler.jsonc`.
- The Supabase URL and anon key are in `.env.production`. Both are public by design, so no build variables are needed.
- **`os.yrstudio.art` (optional, later):** Workers custom domains need the domain's DNS on Cloudflare. Today the DNS for `yrstudio.art` is at Hostinger (dns-parking). Moving it to Cloudflare is free, but it changes DNS for the whole site, so only do it as a planned step.

The main website (GitHub Pages) does not build or deploy anything in `os/`. The two are independent.

## Daily use
- **Inquiry link** for Instagram/TikTok bios and WhatsApp: `https://os.yrstudio.art/inquiry?source=instagram` (or `tiktok`, `whatsapp`). Add `&lang=ar` for Arabic.
- **DMs:** *Leads → Quick add (DM)* creates the client and the lead in one step.
- **PDF:** open a saved quotation, click **PDF / Print**, then **Save as PDF**.

## Backup and restore
- **Backup:** *Settings → Download full backup (JSON)*. Do this weekly and keep the files in Google Drive. The file holds everything: settings, services, templates, clients, leads, quotations, projects, tasks, payments and follow-ups.
- **Restore:** *Settings → Restore from backup…* and pick the file. This **replaces all current data** with the backup. It runs as one database transaction, so it either fully succeeds or changes nothing. Download a fresh backup first.
- **CSV:** clients, leads, quotations (with totals) and projects (with paid/outstanding) open in Excel or Google Sheets, with Arabic text kept intact.
- **Moving to a new Supabase project:** run the two SQL files, create your user, then restore the latest JSON backup.

## Security
- Public sign-up is disabled. Sign-in uses Supabase Auth, with password reset by email.
- Every table has Row Level Security: only users listed in `owners` can read or write. Anonymous visitors and signed-in non-owners get nothing.
- Visitors can do only two things: call `submit_inquiry()` and list service **names** through `public_services()`.
- The inquiry form validates and length-limits every field. It drops bots that fill a hidden field, and limits volume to 3 per contact and 5 per IP per hour, plus 100 per day overall.
- All database access goes through Supabase's parameterised API. There is no hand-built SQL from user input.
- `_headers` sets `noindex`, so the app stays out of Google, and blocks the app from being embedded in other sites.

## Tests
Both tests need Docker. They run against a local Supabase, never production.
```bash
npx supabase start
```
```bash
node tests/access.test.mjs   # 57 checks: access control, form, totals, automations, backup/restore
```
```bash
bun run dev &
```
```bash
node tests/e2e.mjs           # 21 browser checks: full workflow on desktop + phone, screenshots in tests/shots/
```

## Brand tokens
Colours and fonts live in `src/tokens.css`. The values are taken from the live website: `#161616` background, `#000` surfaces, `#FF4848` accent, and the Readex Pro / IBM Plex Sans Arabic fonts. The accent can also be changed from *Settings*. The logo is the site's own file (`public/brand/`).

## Not included (on purpose, for now)
- **Arabic UI inside the app.** The app is English. The public inquiry form is fully bilingual (Arabic with RTL).
- **Push or email reminders.** Follow-ups are in-app. Open the Dashboard daily.
- **Direct Instagram / TikTok / WhatsApp message integration.** Possible later, but only through official APIs. The WhatsApp Business Platform charges per conversation, so it is not free.
- **Exchange-rate conversion.** Money is always shown per currency (e.g. `USD 1,200 · SAR 800`) and never mixed.
