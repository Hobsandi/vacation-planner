# Vacation Planner

Hackathon project: a webapp that plans greener vacations from a user profile.
Stack: Next.js + TypeScript + Tailwind, Supabase, Claude API, Vercel. See `CLAUDE.md` for the full rules.

## Get started (each teammate, once)

```bash
git clone <repo-url>
cd vacation-planner
npm install
cp .env.example .env.local   # fill in keys later; the app runs on mock data without them
npm run dev                  # http://localhost:3000 → "Plan a trip" works with mock data
```

Create your own branch:

| Person | Branch | Owns |
| --- | --- | --- |
| A – Frontend/UX | `frontend` | `app/(pages)/`, `components/`, layout + styles |
| B – Backend/data | `backend` | `lib/db/`, `supabase/`, `app/api/trips/`, deploy |
| C – AI engine | `ai` | `lib/ai/`, `app/api/plan/` |

```bash
git checkout -b frontend      # or backend / ai
```

## Daily loop (every ~2 hours)

```bash
git pull origin main          # get everyone else's work
# ... work with Claude ...
npm run build                 # must pass
git add -A && git commit -m "short description"
git push -u origin <your-branch>
```

Then open a pull request into `main` on GitHub and merge it (no review needed during the hackathon,
but glance at the diff). After merging, the others run `git pull origin main`.

## Working with Claude

Each person uses their own Claude (Claude Code is recommended) inside this repo. Claude reads `CLAUDE.md`
automatically, so everyone shares the same context. Start each session with something like:

> I'm Person C and own `lib/ai/` and `app/api/plan/`. Read CLAUDE.md. Today I want to …

When the team decides something, add a line to the "Decisions log" in `CLAUDE.md` so every Claude knows.
