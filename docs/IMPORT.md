# Importing the portfolio from the old WordPress site

`src/import/wordpress.ts` reads the 23 projects from mymuse.co.il (portfolio sitemap + project pages)
and creates them in Payload: name, field, text, design credit, site link, hero image, screenshots,
and a palette (the five prototype projects keep their approved colours; the rest get one from their image).

It is safe to run again: a project whose slug already exists is skipped, images already uploaded are reused.
Nothing edited in the admin is overwritten. Takes about 1–2 minutes.

## Locally

```bash
LOCAL_PGLITE=1 npm run import:wp
```

## On production (from Ravit's machine, Git Bash)

Only after the PR with the import is merged and deployed (the deploy runs the `credit` migration).

```bash
export PATH="/c/Tools/node:$PATH"
git pull
npm install
npx vercel link                                   # once: team my-muse1, project mymuse-2026
npx vercel env pull .env.production.local --environment=production   # git-ignored
set -a; source .env.production.local; set +a      # DATABASE_URL (Neon) + BLOB_READ_WRITE_TOKEN
LOCAL_PGLITE=0 npm run import:wp                  # LOCAL_PGLITE=0 overrides the local value in .env
rm .env.production.local
```

### From a Claude Code cloud session (only HTTPS out)

The cloud container blocks Postgres on port 5432 (`connect ETIMEDOUT …:5432`); only HTTPS through
its proxy works. `npm run db:bridge` (`src/import/neon-ws-bridge.cjs`) opens 127.0.0.1:5432 and
tunnels each connection over Neon's WebSocket endpoint (`wss://<host>/v2`, port 443) — same
credentials, nothing to change in Neon or Vercel. Used for the first production import (Oct 2026).

`DATABASE_URL` and `BLOB_READ_WRITE_TOKEN` are already set in the session's environment.
Don't run `db:local` or `seed`.

```bash
npm install
npm run db:bridge > /tmp/bridge.log 2>&1 &        # prints "bridge up on 127.0.0.1:5432 -> <host>"
export DATABASE_URL=$(node -e 'const u=new URL(process.env.DATABASE_URL);u.hostname="127.0.0.1";u.port="5432";u.search="?sslmode=disable";console.log(u.href)')
NODE_USE_ENV_PROXY=1 LOCAL_PGLITE=0 npm run import:wp
kill %1                                           # stop the bridge
```

- `sslmode=disable` is correct here: TLS is the WebSocket's; the Postgres protocol inside it runs plain.
- `NODE_USE_ENV_PROXY=1` makes Node's `fetch` (old site, Blob uploads) go through the proxy.
- The bridge itself uses `HTTPS_PROXY` when set, or connects directly when it isn't.
- Never print the rewritten `DATABASE_URL`: it contains the password.

Check: the log ends with `done` and lists 23 `project:` lines; `https://mymuse-2026.vercel.app/api/projects?limit=0` shows `totalDocs: 23`.

## After the import (in /admin)

- Order: newest first. Drag to change; the order is also the "next project" chain.
- All 23 are ticked "להציג בעמוד הבית". Untick to shorten the home page list.
- Texts are the old ones; "משפט מרכזי", "היקף העבודה" and "פלטפורמה" are empty (the old pages had none).
- Colours: check each project's palette (צבעים tab).
