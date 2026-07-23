# test-forest-foxes — Agent Instructions

## Project overview
Interactive "Fox Dispatcher" — test assignment for AI-first Developer at MOX. Monorepo with forest-foxes-frontend, forest-foxes-backend, and standalone fox-engine.

## Key docs (read first)
- `RAW.md` — original test assignment + architectural decisions
- `test-forest-foxes.DOCS.md` — features (F-001..F-012), API reference, DB schema
- `TODO.md` — 14 epics with task breakdown
- `ROADMAP.md` — 7 delivery phases with priority order

## Monorepo setup
- **Nx 22.6.5** + npm workspaces (`apps/*`, `packages/*`)
- **Biome** for lint/format (no ESLint/Prettier). Config: `biome.json`
- **mise.toml** — ports and DB URLs as env vars
- Prefix nx with npm: `npm exec nx run ...` or `npx nx ...`
- No `nx.json` — per-app `project.json` files

## Active projects (forest-foxes)
| Project | Port | Type |
|---|---|---|
| `forest-foxes-frontend` | 3020 | React 19 + Vite 8 + shadcn/ui + Zustand |
| `forest-foxes-backend` | 8020 | NestJS 11 + Prisma 7.8 |
| `forest-foxes-shared-prisma` | — | Prisma schema + generated client |
| `fox-engine` (services/) | — | Standalone, no Nx, no workspace |

## Quick commands
```sh
# Start all forest-foxes dev servers
mise run all

# Typecheck all forest-foxes projects
npx nx run-many --target=typecheck --projects=forest-foxes-frontend,forest-foxes-backend,forest-foxes-shared-prisma

# Lint all
npx nx run-many --target=lint --projects=forest-foxes-frontend,forest-foxes-backend,forest-foxes-shared-prisma

# Prisma
mise run all:db-generate
mise run all:db-push

# Seeds
mise run all:seed-working
mise run all:seed-clean

# Run single dev server
npx nx run forest-foxes-backend:dev
npx nx run forest-foxes-frontend:dev
```

## Database
- **SQLite** at `.db/forest-foxes/dev.db`
- **Prisma schema**: `packages/forest-foxes-shared-prisma/prisma/schema.prisma`
- Models: `Location` (seeded 1-9), `Fox`, `Observation`
- Backend is the **single writer** — fox-engine POSTs via HTTP, never directly
- `FOREST_FOXES_DATABASE_URL` in `mise.toml` controls the DB path

## Root scripts reference
| Script | Effect |
|---|---|
| `npm run format` | Biome format whole repo |
| `npm run lint` | Biome lint whole repo |
| `npm run check` | Biome check + typecheck all |
| `npm run build:all` | Nx build all projects |
| `npm run typecheck:all` | Nx typecheck all projects |
| `mise run all` | Start both dev servers |

## History and worklog
- `HISTORY.md` — AI worklog with numbered stages
- Update it when completing phases
- Mark `[DONE]` in `TODO.md` after verifying work
