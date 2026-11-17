# Roadmap

**Live since 2026-11-17 on https://mymuse.co.il** (Vercel; `www` → 308 to the bare domain; DNS at Cloudflare, DNS only).
What is left is in "Open" at the bottom; the sections below are the history.

State on handoff (2026-10-24): the skeleton builds and runs. Home page, project pages, text pages, admin, migrations,
legacy redirects and noindex-until-launch all work locally. Content is sample content. Not yet deployed.

Work top to bottom. Each step ends with tsc + build + a check in the browser (390×844 and ~1366 wide, plus reduced motion).

## 1. Repo and deploy
- [x] Private GitHub repo `ravitsh1/mymuse-2026`, `main` pushed (2026-10-24).
- [x] Vercel project → Neon + Blob → first deploy: `mymuse-2026.vercel.app` is up (checked 2026-10-24: home, `/admin`, `/api/globals/home` 200; legacy 301s work).
- [x] vercel.app is noindex: robots.txt `Disallow: /` and `X-Robots-Tag: noindex, nofollow` on every response.
- [x] Fixed: built with an empty database, `/portfolio/[slug]` was marked static and every project page returned 500 (`DYNAMIC_SERVER_USAGE`); `generateStaticParams` removed. Needs the fix on `main` + a redeploy.
- [x] Production database: projects imported; accessibility/privacy pages created by migration (footer links them).

## 2. Visual check against the prototype
- [x] Compare each section with `docs/prototype.html` on desktop and mobile (2026-10-24, locally, Playwright 1366×768 + 390×844): matches. Left out on purpose: the index hint line ("רחפו מעל שם…") and the per-project glow position.
- [x] Fly-in and next-project commit hand over with no jump (checked frame by frame from a screen recording). Fixed: the title flashed in place before its rise (arrival now runs before first paint); full prefetch of the next page and of the highlighted row's page + hero image (touch has no peek to pre-load it).
- [x] Light palette (Mosessco): header and text readable. Small dimmed text raised to opacity .85 (Vinspiration labels were 4.1:1); sample Mosessco accent darkened to pass 4.5:1; the accent field now says it needs 4.5:1.
- [ ] Repeat the motion check on production (mymuse.co.il) now that it has projects (first image request per size is slow until the optimizer caches it).
- [x] Header over page text: solved by the header that hides going down and returns going up, solid on project pages (#89, #95).
- [ ] `npm run lint` crashes (ESLint config: circular structure in the react plugin config) — fix the flat config.

## 3. Brand
- [x] Logo in the header and admin (`components/Logo.tsx`, `components/admin/Brand.tsx`); `app/icon.svg` + `app/apple-icon.png`.
- [x] Fonts: Karantina self-hosted by `next/font` (#107), Talent from Blob (preloaded); no Google Fonts link.
- [x] Palette: the 2026 brand book in `lib/brand.ts` (CMS colour fields hidden). Accent word in big headings and in the project statement is burgundy `#801f48` (#112, #113); laser pink only for indicators.

## 4. Real content
- [x] All 23 projects of the old portfolio: `npm run import:wp` (`src/import/wordpress.ts`, see `docs/IMPORT.md`) — tested on an empty database: 23 projects, 72 screenshots, 80 s; re-run skips everything.
- [x] Import run on production: all projects are live (23 visible + hidden ones redirect to `/work`).
- [ ] In the admin: order, which projects are featured on the home page (all 23 now), "משפט מרכזי" per project, palettes. Heroes are 1920px (old site) — replace with 2400px+ where she has them.
- [x] `LEGACY_PROJECTS` in `src/proxy.ts`: all 23 old URLs → new slugs (checked: 301 → 200 for every URL in the old sitemap).
- [ ] Home texts: fuller wording drafted (subtitle, 4 service cards, 3-paragraph about, line under "נדבר?", meta description); migrations `home_texts` + `home_texts_no_accessibility` swap in only texts still equal to the previous wording (no accessibility claims: Ravit is not an accessibility expert). Ravit to confirm the wording and the clients list.
- [x] Accessibility statement and privacy policy: the old site's texts, created by migration `legal_pages_cookie_notice` (2026-10-24). Cookie notice from Settings → הודעת עוגיות.
- [x] Accessibility statement updated for the new site (IS 5568, date 13.11.2026).
- [x] Share image 1200×630 (`mymuse-share-2026.jpg`, migration `share_image`, #109); Facebook + Instagram in the footer.

## 5. Nice to have (ask Ravit before starting)
- [x] Instead of a form: the brief assistant "מימו" (`/brief`, Claude) → Briefs collection + email via Resend. `RESEND_API_KEY` set in Vercel; test brief arrived 2026-11-17.
- [x] Bulk project import from the old WordPress site (2026-10-24).
- [ ] Hero video poster frames (`/poster.jpg` route as on threebears-2026).
- [ ] WebGL image transition between projects (noise/dissolve) — only if it stays light and has a reduced-motion fallback.

## 6. Launch
- [x] Pre-launch check (2026-11-02): every URL in the old site's sitemaps (38) answers 200 or a 301/308 chain to a 200. Hidden projects now redirect to `/#work` (was 404); `/cart`, `/checkout`, `/instagram-3` → home. Robots/`X-Robots-Tag`/canonical flip by host (checked locally with `Host: mymuse.co.il`). Apple touch icon added. Accessibility audit (IS 5568 / WCAG AA) done 2026-11-01.
- [x] VEE accessibility widget in the layout (`components/VeeWidget.tsx`, lazy; tabindex fix); statement says 5568.
- [x] Domain (2026-11-17): `mymuse.co.il` primary on Vercel, `www` → 308; Cloudflare DNS only; Google MX untouched.
- [x] After DNS (2026-11-17): no `X-Robots-Tag`, `<meta name=robots content="index, follow">`, robots.txt allows (26 URLs in the sitemap); old URLs 301 → 200. Search Console verified by meta tag (`verification.google` in the root layout, #115, keep it) and the sitemap submitted; Bing imported from Search Console.
- [x] Before/at launch: keyboard + screen-reader pass and focus fixes (#108); structured data + `llms.txt` (#108); performance (#107); Next 16.4.6 + sharp 0.35.5 for security advisories (#114); cookie notice and privacy policy match what the site stores: GA, VEE, no marketing cookies (#116).
- [x] Lighthouse on mymuse.co.il (2026-11-17, local run: PSI API over quota): mobile 85 / 100 / 100 / 100, desktop 96 / 100 / 100 / 100.
- [x] Trial code removed (2026-11-11): `lib/brand.ts` is the only look; Settings screen in tabs.

## Open (after launch)
- [ ] Search Console: in a few days check Pages (indexed / errors) and the sitemap status; fix any old URL that errors.
- [ ] Mobile Lighthouse saw a 307 from `/` to itself (~0.8 s) before the page: not our code, most likely Vercel's bot protection challenging the test browser. Check on pagespeed.web.dev; if real visitors get it too, look at the Vercel Firewall settings.
- [ ] `npm audit`: `esbuild` (via drizzle-kit) and `happy-dom` (via @lexical/headless) remain; they clear with a Payload update.
- [ ] Optional: longer texts on the thinner project pages (~130 words); wheelchair-entrance line in the accessibility statement.
- [ ] Old tag tables: drop migration prepared but **not approved** — needs Ravit's explicit OK.
