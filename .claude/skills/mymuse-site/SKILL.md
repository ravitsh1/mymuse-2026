---
name: mymuse-site
description: Working on the new MyMuse website (Ravit's own studio site, replacing the WordPress site at mymuse.co.il) — Next.js 16 + Payload 3, Hebrew only, scroll-driven motion and "next project" transitions. Use for ANY request about the new MyMuse site / "האתר החדש של MyMuse": page or motion changes (desktop/mobile), admin (Payload) fields, projects/media, migrations, SEO, legacy redirects, deploys and production checks. Built on the same setup as threebears-2026 (see the threebears-site skill for the long list of pitfalls).
---

# MyMuse site

Ravit's own studio site. **She edits all content in the admin.** Replies to Ravit in Hebrew, short, with what was checked and how. One question at a time, only when a decision is really hers.

## Where things are

| What | Where |
| --- | --- |
| Code | this repo (Next.js 16.4 + Payload 3.92 in one app) |
| Production | Vercel (Neon Postgres + Vercel Blob integrations), build = `npm run ci` (= `payload migrate && next build`) |
| Domain | `mymuse.co.il` — today the old WordPress site. Until it points here, everything else is noindex |
| Admin | `/admin` (Hebrew UI, dashboard cards in `components/admin/Dashboard.tsx`) |
| DB | Postgres (`DATABASE_URL`). Local: PGlite on port 5433 (`npm run db:local`, scripts need `LOCAL_PGLITE=1`) |
| Media | Vercel Blob in production (`BLOB_READ_WRITE_TOKEN`), `/media` on disk locally |
| Prototype | `docs/prototype.html` — the approved scroll/motion prototype this site was ported from |
| Roadmap | `docs/ROADMAP.md` — open work, in order |

## Stack in one paragraph

Same base as threebears-2026, minus localization and leads: `payload.config.ts` derives `PAYLOAD_SECRET` from `DATABASE_URL` and the server URL from `VERCEL_PROJECT_PRODUCTION_URL`, `push: false` (migrations only), Vercel Blob with `clientUploads`, live preview with mobile/tablet/desktop sizes. `src/proxy.ts` holds the 301 map from the old WordPress URLs (Hebrew slugs like `/portfolio/jullius-יוליוס/`) and strips trailing slashes **with a fresh `new URL()`** — `req.nextUrl.clone()` re-adds the slash and loops (threebears-2026 still has the clone version).

## Code map

- `src/collections/` Projects (tabs: תוכן / מדיה / צבעים / קידום; sidebar: featured, hidden; `orderable` → drag order = "next project" chain), Pages (`/<slug>`: accessibility, privacy), Media (alt, focal point, **0-byte Blob upload fix**), Users.
- `src/globals/` Home (Passion words + colours, work title, service cards, about, clients, contact title), Settings (email, phone, social, site colours, meta description, share image).
- `src/fields/` color.ts (hex text + validation), seo.ts (`metaDescriptionField`).
- `src/components/` Visual (+ `MediaEl`: video / img for GIF-SVG / next/image), NextFrame, Motion (all client motion), Header, Footer, Interactive (marquee with pause, copy buttons), JsonLd, LivePreviewRefresh, admin/ (Dashboard, Brand).
- `src/lib/` data.ts (`getProjects` = visible, `_order`), media.ts (`mediaUrl` strips own origin), seo.ts (`SITE_URL`, `pageMetadata`, `shareImageOf`), site.ts (`LIVE_HOSTS`).
- `src/app/(frontend)/` `page.tsx` (home), `portfolio/[slug]`, `[slug]` (text pages), `styles.css`. `src/app/robots.ts`, `sitemap.ts` (must stay at app root, not inside the route group).
- `src/seed.ts` sample projects + placeholder legal pages — local only.

## How the motion works (keep these contracts)

- Server renders complete, readable HTML; `Motion.tsx` only enhances it via `data-*` hooks: `data-site` (palette vars + base colours), `data-ph`/`data-wcol`/`data-tick` (Passion words), `data-rows` + `data-visual-for` (home index, hover peek, fly-in), `data-reveal`, `data-speed` / `data-h` (parallax), `data-next` + `data-nframe` + `data-ring`/`data-pct` (next-project frame).
- The same `<Visual>` markup is the hero, the next frame, the peek and the fly-in — that is what makes the hand-over seamless. Change it in one place.
- Next-project commit: progress ≥ 99.5% held 250 ms → `router.push`; scrolling back cancels. The `מעבר ל…` link is the keyboard/reduced-motion path.
- `prefers-reduced-motion`: CSS turns sticky/scrubbed sections static, JS skips everything except the progress bar. Never put content behind an animation.
- Colours come only from the CMS as `--p-*` / `--v-*` / `--c-*` custom properties.

## Run locally

```bash
npm run db:local                                   # PGlite :5433 (keep it running)
cp .env.example .env
LOCAL_PGLITE=1 npm run payload -- migrate
LOCAL_PGLITE=1 npm run seed                         # first time only
npm run dev                                         # http://localhost:3030
```
One-off scripts: write `./_x.tmp.ts`, run `LOCAL_PGLITE=1 npm run payload -- run ./_x.tmp.ts`, delete it.
Stopping a test server: `fuser -k <port>/tcp`. **Never `pkill -f "next start"`** from a shell whose own command line contains that text — it kills the shell and leaves the old server answering later tests.

## Making a change — the checklist

1. Read the relevant file(s) first; match the surrounding style (English comments explain *why*).
2. Schema change → `npm run generate:types` → `yes '' | LOCAL_PGLITE=1 npm run payload -- migrate:create <name>` → for production tables with data, first statement prod-only: `SET LOCAL lock_timeout='30s'; LOCK TABLE "<every table it touches>" IN ACCESS EXCLUSIVE MODE;` → `LOCAL_PGLITE=1 npm run payload -- migrate`.
3. Data migrations touch only rows still in the exact wrong state — never overwrite Ravit's edits.
4. New admin fields: Hebrew label + a description that says what an empty value does; defaults keep today's look.
5. `npx tsc --noEmit`, then `npm run build` (Next refuses to build on a version with a known vulnerability — bump `next` when that happens).
6. Commit (Co-Authored-By line from the system reminder), push, wait for the Vercel deploy, verify on production (curl the page, `/api/projects`, `/api/globals/home`; browser at 390×844 and ~1366 wide).

## Launch day

Connect `mymuse.co.il` + `www` in Vercel → confirm `robots.txt` allows and `X-Robots-Tag` is gone → spot-check the legacy 301s (`/portfolio/<old-hebrew-slug>/`, `/about-us/`, `/הצהרת-נגישות/`) → submit the sitemap. Projects not migrated yet redirect to `/#work`; when one is added, put its new slug in `LEGACY_PROJECTS`.

## Open items

- Real images/videos and texts for the projects (sample texts are placeholders).
- Accessibility statement and privacy policy: fill the `[להשלמה]` parts.
- Display font: Karantina (Google Fonts). Body text is Tel Aviv Modernist (Fontef licence #04791, mymuse.co.il) served from the Blob store `fonts/` — keep font files out of this public repo. Logo: `components/Logo.tsx` (traced SVG, currentColor) + `app/icon.svg`.
- Remaining old projects → new pages + `LEGACY_PROJECTS` slugs.
