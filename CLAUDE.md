# CLAUDE.md – Vacation Planner (hackathon, 24 h)

Read this first in every session. Three people each work in this repo with their own Claude.

## The product
A webapp that plans vacations from a user profile filled in at sign-up.
Theme: "a digital solution for a better tomorrow". Every plan shows a CO₂ estimate and prefers
train/bus and off-season, less-crowded destinations where realistic.

MVP flow (nothing else matters until this works end to end):
sign up → fill in profile → "plan a trip" form → AI-generated plan → save → "My trips".

## Stack
- Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- Supabase (auth + Postgres) – `@supabase/ssr`, `@supabase/supabase-js`
- Claude API – `@anthropic-ai/sdk`, called ONLY from server code (API routes)
- Zod for validating AI output and request bodies
- Hosted on Vercel; every push to `main` deploys

## Folder ownership – edit only your own folders
| Owner | Folders |
| --- | --- |
| Person A – Frontend/UX | `app/(pages)/`, `app/page.tsx`, `app/layout.tsx`, `app/globals.css`, `components/` |
| Person B – Backend/data | `lib/db/`, `supabase/`, `app/api/trips/`, deploy config |
| Person C – AI engine | `lib/ai/`, `app/api/plan/` |
| Shared (announce changes in team chat first) | `lib/types.ts`, `CLAUDE.md`, `package.json` |

If your task needs a change in someone else's folder: do NOT make it. Tell the human what change is
needed so they can ask the owner.

## The contract
`lib/types.ts` holds the Zod schemas + types `Profile`, `TripRequest`, `TripPlan`, `SavedTrip`.
Everyone builds against these. Until the real parts work, use `lib/mock.ts`.

API routes:
- `POST /api/plan` body `{ profile: Profile, request: TripRequest }` → `TripPlan`
- `GET /api/trips` → `SavedTrip[]`
- `POST /api/trips` body `{ request: TripRequest, plan: TripPlan }` → `SavedTrip`

## Rules
- Small commits, merge to `main` at least every 2 hours via pull request.
- Work on your own branch: `frontend`, `backend` or `ai`. `git pull origin main` often.
- Never commit secrets. Keys live in `.env.local` (git-ignored) and in Vercel. See `.env.example`.
- Run `npm run build` before opening a PR – a broken `main` breaks the deploy for everyone.
- Prefer simple, working code over clever code. This is a 24-hour hackathon.
- Prices and CO₂ figures from the AI are estimates; label them as such in the UI.

## Commands
- `npm run dev` – local dev on http://localhost:3000
- `npm run build` – production build (must pass before merging)
- `npm run lint`

## Decisions log
Add one line here when the team decides something others need to know.
- Repo: https://github.com/Hobsandi/vacation-planner (private; owner Hobsandi, collaborators Harald333, midvintersolen)
- Plan doc (shared): https://claude.ai/code/artifact/9ebfe6b6-d3bc-434c-86ce-3a18e0ac216c
