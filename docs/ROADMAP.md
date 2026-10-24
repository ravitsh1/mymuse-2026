# Roadmap

State on handoff (2026-10-24): the skeleton builds and runs. Home page, project pages, text pages, admin, migrations,
legacy redirects and noindex-until-launch all work locally. Content is sample content. Not yet deployed.

Work top to bottom. Each step ends with tsc + build + a check in the browser (390×844 and ~1366 wide, plus reduced motion).

## 1. Repo and deploy
- [x] Private GitHub repo `ravitsh1/mymuse-2026`, `main` pushed (2026-10-24).
- [x] Vercel project → Neon + Blob → first deploy: `mymuse-2026.vercel.app` is up (checked 2026-10-24: home, `/admin`, `/api/globals/home` 200; legacy 301s work).
- [x] vercel.app is noindex: robots.txt `Disallow: /` and `X-Robots-Tag: noindex, nofollow` on every response.
- [x] Fixed: built with an empty database, `/portfolio/[slug]` was marked static and every project page returned 500 (`DYNAMIC_SERVER_USAGE`); `generateStaticParams` removed. Needs the fix on `main` + a redeploy.
- [ ] Production database is empty: no projects, and no accessibility/privacy pages (the footer has no link to the accessibility statement — required before launch). Ravit adds them in `/admin` (the seed is local only).

## 2. Visual check against the prototype
- [x] Compare each section with `docs/prototype.html` on desktop and mobile (2026-10-24, locally, Playwright 1366×768 + 390×844): matches. Left out on purpose: the index hint line ("רחפו מעל שם…") and the per-project glow position.
- [x] Fly-in and next-project commit hand over with no jump (checked frame by frame from a screen recording). Fixed: the title flashed in place before its rise (arrival now runs before first paint); full prefetch of the next page and of the highlighted row's page + hero image (touch has no peek to pre-load it).
- [x] Light palette (Mosessco): header and text readable. Small dimmed text raised to opacity .85 (Vinspiration labels were 4.1:1); sample Mosessco accent darkened to pass 4.5:1; the accent field now says it needs 4.5:1.
- [ ] Repeat the motion check on production once it has projects (first image request per size is slow until the optimizer caches it).
- [ ] Ask Ravit: header has no background, so on scroll it overlaps page text (most visible on light pages). Keep, or add a backdrop?
- [ ] `npm run lint` crashes (ESLint config: circular structure in the react plugin config) — fix the flat config.

## 3. Brand
- [ ] Ravit's logo (SVG) in the header and admin (`components/admin/Brand.tsx`), favicon set in `public/`.
- [ ] Brand fonts: if she has them, self-host in `public/fonts` (woff2) and swap the Google Fonts link; Hebrew/Latin split with `unicode-range` as on threebears-2026.
- [ ] Final colour palette for the home page (Settings → צבעי עמוד הבית) and the Passion words.

## 4. Real content
- [x] All 23 projects of the old portfolio: `npm run import:wp` (`src/import/wordpress.ts`, see `docs/IMPORT.md`) — tested on an empty database: 23 projects, 72 screenshots, 80 s; re-run skips everything.
- [ ] Run the import on production (Ravit, `docs/IMPORT.md`) after this PR is deployed.
- [ ] In the admin: order, which projects are featured on the home page (all 23 now), "משפט מרכזי" per project, palettes. Heroes are 1920px (old site) — replace with 2400px+ where she has them.
- [x] `LEGACY_PROJECTS` in `src/proxy.ts`: all 23 old URLs → new slugs (checked: 301 → 200 for every URL in the old sitemap).
- [ ] Home texts: fuller wording drafted (subtitle, 4 service cards, 3-paragraph about, line under "נדבר?", meta description); migrations `home_texts` + `home_texts_no_accessibility` swap in only texts still equal to the previous wording (no accessibility claims: Ravit is not an accessibility expert). Ravit to confirm the wording and the clients list.
- [ ] Accessibility statement and privacy policy: replace the `[להשלמה]` placeholders.
- [ ] Settings: share image (1200×630), social links.

## 5. Nice to have (ask Ravit before starting)
- [ ] Contact form with leads + email (threebears-2026 has a working Leads collection + Resend).
- [x] Bulk project import from the old WordPress site (2026-10-24).
- [ ] Hero video poster frames (`/poster.jpg` route as on threebears-2026).
- [ ] WebGL image transition between projects (noise/dissolve) — only if it stays light and has a reduced-motion fallback.

## 6. Launch
- [ ] Point mymuse.co.il + www to Vercel; confirm robots/noindex flipped by itself.
- [ ] Spot-check legacy 301s: `/portfolio/<old-hebrew-slug>/`, `/about-us/`, `/הצהרת-נגישות/`, `/privacy-policy/`.
- [ ] Submit the sitemap (Search Console + Bing). Full accessibility audit of the live site.
