# MyMuse – new studio site

Ravit's own site (MyMuse, web studio since 2010), replacing the WordPress site at mymuse.co.il.
Next.js 16.4 + Payload 3.92 in one app, Hebrew only (RTL), content edited in `/admin`.
Same base setup as `ravitsh1/threebears-2026`.

**Read `.claude/skills/mymuse-site/SKILL.md` before any change** — code map, motion contracts, run/deploy routine, change checklist.
Open work, in order: `docs/ROADMAP.md`. Motion reference: `docs/prototype.html` (the approved prototype; open it in a browser).

## Working with Ravit

- Reply in Hebrew, short: what changed, what was checked and how.
- One question at a time, only when the decision is really hers (design taste, content, anything irreversible).
- She is a web developer and accessibility professional: accessibility is a requirement, not a nice-to-have (WCAG 2.2 AA, Israeli IS 5568).

## Local setup (Windows, Git Bash)

Suggested location: `C:\Sites\MyMuse-2026\site` (next to `C:\Sites\3Bears-2026\site`).
On Ravit's machine node may not be on PATH: `export PATH="/c/Tools/node:$PATH"` (as on threebears-2026).

```bash
npm install
cp .env.example .env
npm run db:local                       # PGlite on :5433 — run in the background, keep it running
LOCAL_PGLITE=1 npm run payload -- migrate
LOCAL_PGLITE=1 npm run seed            # first time only: 5 sample projects + legal page placeholders
npm run dev                            # http://localhost:3030 (3Bears uses 3020)
```

First visit to `/admin` creates the admin user. For a local test user, follow the threebears-site skill (script with a generated password; never touch production credentials).

## Rules that are easy to break

- Schema changes only through migrations (`push: false`). See the skill's checklist.
- `<Visual>` is shared by hero / next frame / peek / fly-in — the seamless transition depends on it staying identical.
- Content must be readable without JS and under `prefers-reduced-motion`; motion only enhances.
- Never render `mediaUrl()` in a raw `<img>`; use `MediaEl`.
- `robots.ts` / `sitemap.ts` stay at `src/app/` root (inside the route group they are shadowed by `[slug]`).
- Redirects in `proxy.ts` use `new URL()`, not `req.nextUrl.clone()` (trailing-slash loop).
- `npx tsc --noEmit` and `npm run build` before every commit. Commits end with the Co-Authored-By line.
