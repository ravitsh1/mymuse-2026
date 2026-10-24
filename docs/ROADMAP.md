# Roadmap

State on handoff (2026-10-24): the skeleton builds and runs. Home page, project pages, text pages, admin, migrations,
legacy redirects and noindex-until-launch all work locally. Content is sample content. Not yet deployed.

Work top to bottom. Each step ends with tsc + build + a check in the browser (390×844 and ~1366 wide, plus reduced motion).

## 1. Repo and deploy
- [ ] Private GitHub repo (suggested `ravitsh1/mymuse-2026`), push `main`.
- [ ] Vercel project (team `my-muse1`, like threebears-2026) → connect the Neon and Blob integrations → first deploy (`npm run ci` runs the migration).
- [ ] Create Ravit's admin user on production; confirm the vercel.app URL is noindex (robots.txt `Disallow: /`, `X-Robots-Tag`).

## 2. Visual check against the prototype
- [ ] Compare each section with `docs/prototype.html` on desktop and mobile: Passion words, work index (hover peek on desktop, centre-highlight on touch), service cards, about reveal, clients marquee, contact, next-project frame.
- [ ] The click-to-project fly-in and the next-project commit should hand over with no visible jump (same `<Visual>` on both sides). Fix any flash on arrival.
- [ ] Check the admin-driven palette: a light project (Mosessco sample) must keep the header and text readable.

## 3. Brand
- [ ] Ravit's logo (SVG) in the header and admin (`components/admin/Brand.tsx`), favicon set in `public/`.
- [ ] Brand fonts: if she has them, self-host in `public/fonts` (woff2) and swap the Google Fonts link; Hebrew/Latin split with `unicode-range` as on threebears-2026.
- [ ] Final colour palette for the home page (Settings → צבעי עמוד הבית) and the Passion words.

## 4. Real content
- [ ] Projects: real hero images (2400px+), optional short video loop, two parallax screenshots + gallery, real texts. Start with the five sample slugs, then the rest of the old portfolio.
- [ ] For each project added, put its new slug in `LEGACY_PROJECTS` in `src/proxy.ts`.
- [ ] Home texts: subtitle, services, about, clients list (Ravit to confirm the sample wording).
- [ ] Accessibility statement and privacy policy: replace the `[להשלמה]` placeholders.
- [ ] Settings: share image (1200×630), social links.

## 5. Nice to have (ask Ravit before starting)
- [ ] Contact form with leads + email (threebears-2026 has a working Leads collection + Resend).
- [ ] Bulk project import from the old WordPress site (threebears-2026 `src/import/wordpress.ts` is a starting point).
- [ ] Hero video poster frames (`/poster.jpg` route as on threebears-2026).
- [ ] WebGL image transition between projects (noise/dissolve) — only if it stays light and has a reduced-motion fallback.

## 6. Launch
- [ ] Point mymuse.co.il + www to Vercel; confirm robots/noindex flipped by itself.
- [ ] Spot-check legacy 301s: `/portfolio/<old-hebrew-slug>/`, `/about-us/`, `/הצהרת-נגישות/`, `/privacy-policy/`.
- [ ] Submit the sitemap (Search Console + Bing). Full accessibility audit of the live site.
