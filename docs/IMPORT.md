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

Check: the log ends with `done` and lists 23 `project:` lines; `https://mymuse-2026.vercel.app/api/projects?limit=0` shows `totalDocs: 23`.

## After the import (in /admin)

- Order: newest first. Drag to change; the order is also the "next project" chain.
- All 23 are ticked "להציג בעמוד הבית". Untick to shorten the home page list.
- Texts are the old ones; "משפט מרכזי", "היקף העבודה" and "פלטפורמה" are empty (the old pages had none).
- Colours: check each project's palette (צבעים tab).
