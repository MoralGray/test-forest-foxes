# test-forest-foxes

<!---------------------------------------------------------------------------------------------------->

## Concept

**Концепт:** Интерактивное приложение «Лисий диспетчер» — тестовое задание для AI-first Developer в MOX. Лесной смотритель отслеживает наблюдения за лисами в волшебном лесу: где замечена, какого цвета, с добычей ли, насколько подозрительна. Интерфейс включает карту леса 3x3, сайдбары событий, статистику, таблицу всех наблюдений и AI Worklog. Архитектура — монорепа на Nx с фронтендом (React), бекендом (NestJS + Prisma) и отдельным сервисом-генератором событий (fox-engine).

**Project Overview:** Interactive "Fox Dispatcher" application — a test assignment for an AI-first Developer position at MOX. A forest ranger tracks fox observations in a magical forest: location, color, prey status, suspicion level. The interface includes a 3x3 forest map, event sidebars, statistics, a full data table, and an AI Worklog. Architecture is an Nx monorepo with a frontend (React), backend (NestJS + Prisma), and a standalone event generator service (fox-engine).

<!---------------------------------------------------------------------------------------------------->

## Architecture

```
[fox-engine] ──POST /api/observations──→ [forest-foxes-backend]
  (services/)                               (apps/)
                                               |
[forest-foxes-frontend] ──/api/* proxy──→      |
  (apps/)                                      |
                                               | Prisma ORM
                                               v
                                        [SQLite / Postgres]
                                          (.db/forest-foxes/)

                                   [packages/forest-foxes-shared-prisma]
                                     (shared Prisma types — consumed by backend only)
```

### Frontend

- **App:** `apps/forest-foxes-frontend/`
- **Stack:** React 19, Vite 8, Tailwind CSS 4, TypeScript 5.9
- **Component Library:** `@mg-nx-forge/mg-ui-shadcn-4` (shadcn/ui v4, Radix Vega)
- **State Management:** Zustand 5
- **Routing:** React Router v7
- **API Layer:** Axios (`@mg-nx-forge/mg-api-axios-1`) via Vite proxy (`/api` → backend)
- **Pages:** `/` (Home — upper: map + event sidebars; lower: tabbed table + donut sidebars), `/worklog` (AI Worklog)
- **Port:** `3020`

### Backend

- **App:** `apps/forest-foxes-backend/`
- **Stack:** NestJS 11, Prisma 7.8, TypeScript 5.9
- **Database:** SQLite (dev), Postgres (prod)
- **Validation:** class-validator + class-transformer
- **Global prefix:** `/api`
- **Port:** `8020`

### Services

- **Service:** `services/fox-engine/`
- **Stack:** TypeScript + tsx (standalone script)
- **Purpose:** Generates random observations every 30 seconds and pushes them via HTTP POST to backend
- **Lifetime:** Not managed by Nx — runs independently

### Shared Packages

- **`packages/forest-foxes-shared-prisma/`** — Prisma schema, generated client, `createPrismaClient()` factory
- Consumed by: `forest-foxes-backend`
- Linked via `tsconfig.json` paths + Vite aliases

### Data Flow

1. `fox-engine` generates random observations → sends HTTP POST to backend (`/api/observations`)
2. Backend persists via Prisma → SQLite/Postgres
3. Frontend polls or queries backend via REST API (`/api/observations`)
4. User interacts with upper section: map (click location), event sidebars (click event)
5. Event detail modal allows field editing and status change (pending → processed)
6. Lower section has 3 tabs ("Все события", "Самые подозрительные", "Обработанные")
7. Tab switch triggers refetch: center table + left donuts (all) + right donuts (processed subset)
8. Statistics reaggregate on every data change via backend aggregation queries
9. Seeds (clean/working/crash-test) populate DB on demand

### UI Layout — Home Page (`/`)

```
UPPER SECTION:
┌──────────────────────┬──────────────────────────┬──────────────────────┐
│  Left sidebar        │  Center (map 3x3)         │  Right sidebar       │
│  (pending events)    │                          │  (processed events)   │
│                      │    ┌────┬────┬────┐      │                      │
│  [Import JSON]──────  │    │ 1  │ 2  │ 3  │      │  ┌────────────────┐  │
│  ┌────────────────┐  │    ├────┼────┼────┤      │  │ obs_002 (✓)    │  │
│  │ fox_001        │  │    │ 4  │ 5  │ 6  │      │  │ fox_002        │  │
│  │ Сев.поляна     │  │    ├────┼────┼────┤      │  │ Тум.тропа      │  │
│  │ susp: 8        │  │    │ 7  │ 8  │ 9  │      │  │ susp: 5        │  │
│  └────────────────┘  │    └────┴────┴────┘      │  └────────────────┘  │
│  ┌────────────────┐  │                          │  ┌────────────────┐  │
│  │ obs_003        │  │   (cells highlight       │  │ obs_004 (✓)    │  │
│  │ fox_001        │  │    on active events)     │  │ fox_003        │  │
│  │ Сев.поляна     │  │                          │  │ Мох.овраг      │  │
│  │ susp: 9        │  │                          │  │ susp: 7        │  │
│  └────────────────┘  │                          │  └────────────────┘  │
└──────────────────────┴──────────────────────────┴──────────────────────┘

LOWER SECTION:
                 [Все события] [Самые подозрительные] [Обработанные]
┌──────────────────────┬──────────────────────────┬──────────────────────┐
│  Left sidebar        │  Center (table)           │  Right sidebar       │
│  (donuts + summary)  │                          │  (donut + ranking)   │
│                      │   id │fox │loc │susp│…   │                      │
│  🍩 color            │  ────┼────┼────┼────┼…   │  🍩 suspicion level  │
│  🍩 location         │  …   │    │    │    │    │                      │
│  🍩 has_prey         │  …   │    │    │    │    │  Top 5 лис           │
│                      │  …   │    │    │    │    │  #1 fox_003 9.2     │
│  ───────────────     │                          │  #2 fox_001 7.5     │
│  Summary Card        │                          │  #3 fox_005 6.1     │
│  Уник. лис: 12       │                          │  #4 fox_004 5.8     │
│  Всего: 47           │                          │  #5 fox_002 5.0     │
│  Avg susp: 5.8       │                          │                      │
│  #1 fox_003 → 5×    │                          │  ───────────────     │
│  4× prey · avg 9.2  │                          │  Factor Impact       │
│  Сев.поляна          │                          │  с добычей → 7.2    │
│                      │                          │  без добычи → 4.1   │
│                      │                          │  рыжие → 6.8        │
│                      │                          │  чёрные → 5.2       │
└──────────────────────┴──────────────────────────┴──────────────────────┘
```

<!---------------------------------------------------------------------------------------------------->

## Features

### Feature: Interactive Forest Map
- ID: F-001
- Status: Done
- Description
- - 3x3 grid map of the magical forest, each cell represents a Location
- - Each cell highlights/animated when an observation occurs at that location
- - Click a cell to show events for that location
- - Colored indicators show suspicion level and activity density per cell
- User Flow
- - Navigate to /
- - See the forest map in the center column
- - Observe animated highlights on cells with active observations
- - Click a cell to filter events by that location
- Technical Notes
- - Grid implemented as CSS Grid 3x3 with a background image
- - Each cell has location_id (1-9) mapped to a Location record in DB
- - Highlight animation: CSS keyframe pulse with color based on suspicion_level avg
- - Click handler updates Zustand store filter
- Test Spec
- - Verify 9 grid cells are rendered
- - Verify cell highlights when observations exist for that location
- - Verify click filter works

### Feature: Event Inbox (Left Sidebar)
- ID: F-002
- Status: Done
- Description
- - Displays incoming (pending) observations as a scrollable list
- - Each item shows: fox_id, color, location, suspicion_level, time
- - Import JSON button above the event list to bulk-upload observations
- - Auto-updates when new events arrive from fox-engine (every 30s)
- - Click an event to open detail modal
- User Flow
- - Navigate to /
- - See Import JSON button above the left sidebar event list
- - Click Import JSON → file picker or paste area
- - Select JSON file → events imported → list refreshes
- - See pending events in left sidebar
- - Observe new events appearing in real time
- - Click an event to open modal
- Technical Notes
- - Zustand store holds observation list, fetched from GET /api/observations?status=pending
- - Import button calls POST /api/observations/import with file contents
- - Shows success count or error toast after import
- - Polling or SSE for real-time updates from fox-engine
- - Uses `@mg-nx-forge/mg-ui-shadcn-4` ScrollArea and Button components
- Test Spec
- - Verify pending events are displayed
- - Verify Import JSON button is visible above the list
- - Verify valid JSON import succeeds with correct count
- - Verify invalid JSON shows error
- - Verify new events appear within 30s
- - Verify click opens modal

### Feature: Processed Events (Right Sidebar)
- ID: F-003
- Status: Done
- Description
- - Displays processed (completed) observations as a scrollable list
- - Same format as Event Inbox but with checked/processed styling
- - Click a processed event to reopen and review details
- User Flow
- - Process an event via modal → it moves from left to right sidebar
- - Click a processed event to view original details
- Technical Notes
- - Fetched from GET /api/observations?status=processed
- - Visual distinction: muted colors, checkmark icon
- - Same Zustand store, different filter slice
- Test Spec
- - Verify processed events render in right sidebar
- - Verify event moves from left to right after processing
- - Verify click reopens modal (read-only by default)

### Feature: Event Detail Modal
- ID: F-004
- Status: Done
- Description
- - Modal dialog showing full observation details
- - All fields are editable: fox_id, location, color, has_prey, suspicion_level, time
- - "Mark as processed" button changes status and moves event to right sidebar
- - "Save" button persists field edits to backend
- User Flow
- - Click event in left sidebar → modal opens
- - Edit any field directly in the modal
- - Click "Mark as processed" → modal closes, event moves to right sidebar
- - Click "Save" → changes persist to DB
- Technical Notes
- - Uses `@mg-nx-forge/mg-ui-shadcn-4` Dialog component
- - PATCH /api/observations/:id for field updates
- - PATCH /api/observations/:id/process for status change
- - Form validation via class-validator on backend
- Test Spec
- - Verify modal opens on event click
- - Verify all fields are editable
- - Verify "Save" persists changes (PATCH request)
- - Verify "Mark as processed" changes status

### Feature: Lower Section — Charts & Table
- ID: F-005
- Status: Done
- Description
- - Lower section on `/` with 3-column layout: left donuts / center table / right donuts
- - Left sidebar: donut charts for all events in the active tab
- - - Distribution by color
- - - Distribution by location
- - - Has_prey ratio (true/false)
- - Below donuts: Summary Card with key metrics (see F-012)
- - Right sidebar: donut charts + ranking for processed events in the active tab
- - - Suspicion level distribution (donut)
- - - Top 5 most suspicious foxes (ranking table: fox_id, avg suspicion, count, last seen)
- - Below Top 5: Factor Impact table (see F-012)
- - Sidebars reactively follow the active tab (see F-006 for tab behavior)
- - Tooltip on each donut segment shows count and percentage
- User Flow
- - Scroll down on /
- - View left donuts (color, location, prey) reflecting current tab data
- - View summary card below donuts (unique foxes, total obs, avg suspicion, top suspect)
- - View right donut (suspicion) + Top 5 table reflecting processed subset of current tab
- - View factor impact table below Top 5
- - Switch tab → both sidebars and table update together
- - Hover donut segment → tooltip with count/%
- Technical Notes
- - Uses recharts or `@mg-nx-forge/mg-ui-shadcn-4` chart components (PieChart with donut variant)
- - Data from GET /api/observations/stats with query: `?tab=all|suspicious|processed`
- - Left donuts filter: all events matching tab
- - Right donuts filter: processed events matching tab
- - Top 5 ranking: computed from GET /api/observations/top-suspicious?limit=5&status=processed
- Test Spec
- - Verify left donuts render for current tab data
- - Verify right donut and Top 5 table render
- - Verify switching tab updates all 3 columns
- - Verify tooltip shows correct data

### Feature: Tabbed Events Table
- ID: F-006
- Status: Done
- Description
- - Lower-center section: tabs with data table below
- - Three tabs: "Все события", "Самые подозрительные", "Обработанные"
- - Table shows events corresponding to the active tab
- - Sidebars (F-005) follow the active tab — left donuts from all, right donuts from processed subset
- - Tab behavior matrix:
- - | Tab | Table data | Left donuts | Right donuts |
- - |---|---|---|---|
- - | Все события | all observations (default) | ALL | PROCESSED subset |
- - | Самые подозрительные | top N by suspicion_level | top suspicious subset | processed among top suspicious |
- - | Обработанные | status=processed | PROCESSED only | PROCESSED only |
- - Table columns: id, fox_id, location, color, has_prey, suspicion_level, time, status
- - Click row to open event detail modal
- User Flow
- - Scroll down on /
- - See "Все события" tab active by default
- - View all observations in the table
- - Click "Самые подозрительные" → table filters to high-suspicion events, sidebars update
- - Click "Обработанные" → table shows only processed, sidebars update
- - Click column header to sort
- - Click row to open modal
- Technical Notes
- - Uses `@mg-nx-forge/mg-table-tanstack` (TanStack Table)
- - Tab state managed in TabStore (Zustand)
- - "Все события": GET /api/observations (paginated)
- - "Самые подозрительные": GET /api/observations?suspicion_min=7&sort=suspicion_level&order=desc
- - "Обработанные": GET /api/observations?status=processed
- - All tab queries include `page` and `limit` params
- Test Spec
- - Verify table renders with correct data per tab
- - Verify switching tab updates table + both sidebars
- - Verify column sorting works
- - Verify row click opens modal

### Feature: Top 5 Suspicious Foxes (Right Sidebar)
- ID: F-011
- Status: Done
- Description
- - Ranking table in the right sidebar (lower section) showing top 5 most suspicious foxes
- - Columns: rank, fox_id, avg suspicion, observation count, last location, last time
- - Data filtered to processed events within the active tab
- - Highlights the #1 fox with visual emphasis (icon, color, label "самая подозрительная")
- User Flow
- - Scroll down on /
- - View Top 5 ranking in the right sidebar
- - See #1 fox highlighted with reason summary
- - Switch tab → Top 5 recomputes for the new tab's processed subset
- Technical Notes
- - Data from GET /api/observations/top-suspicious?limit=5&status=processed&tab=... 
- - Aggregation on backend: GROUP BY fox_id, AVG(suspicion_level), COUNT(*), latest observation
- - #1 fox gets a styled badge + tooltip explaining why (highest avg suspicion, N observations)
- - Empty state: "Нет отработанных наблюдений" when no processed events
- Test Spec
- - Verify Top 5 ranking renders with correct data
- - Verify #1 fox is visually distinct
- - Verify ranking recomputes on tab switch
- - Verify empty state when no processed events

### Feature: Suspicion Analysis Panel
- ID: F-012
- Status: Done
- Description
- - Two analysis blocks that explain suspicion patterns (covers ORIG #1, #3, #4)
- - Left block — Summary Card (below donuts in left sidebar, lower section):
- - - Unique foxes count
- - - Total observations count
- - - Average suspicion level across all events in active tab
- - - Most suspicious fox card: fox_id, observation count, times with prey, avg suspicion, primary location
- - - Data scoped to active tab (see F-006)
- - Right block — Factor Impact table (below Top 5 in right sidebar, lower section):
- - - Rows: "с добычей" vs "без добычи" with avg suspicion + visual bar
- - - Rows by color: each color with avg suspicion + visual bar
- - - Data scoped to processed events within active tab
- - Both blocks recompute on tab switch
- User Flow
- - Scroll down on /
- - See Summary Card in left sidebar: unique foxes, total obs, avg suspicion
- - Read "Самая подозрительная" row with key facts
- - See Factor Impact table in right sidebar: prey and color correlation with suspicion
- - Switch tab → both blocks recompute
- Technical Notes
- - Data for Summary Card: GET /api/observations/stats?tab=... returns aggregated metrics
- - Data for Factor Impact: GET /api/observations/stats?tab=... returns breakdown by has_prey and color
- - Visual bar: CSS width percentage based on max avg suspicion across all rows
- - Empty state: "Нет данных" when tab has no events
- - Summary card #1 fox link: clicking opens event list filtered by that fox_id
- Test Spec
- - Verify Summary Card shows correct metrics
- - Verify #1 fox card displays key facts
- - Verify Factor Impact table renders rows with bars
- - Verify both blocks recompute on tab switch

### Feature: AI Worklog Page
- ID: F-007
- Status: Done
- Description
- - Dedicated page at /worklog showing AI Worklog content
- - Content sourced from HISTORY.md — key checkpoints of AI-assisted development
- - Simple text/typography layout, no complex interactions
- User Flow
- - Navigate to /worklog
- - Read the AI Worklog entries
- Technical Notes
- - Static page with content from HISTORY.md (manually synced)
- - Uses typography components from `@mg-nx-forge/mg-ui-shadcn-4`
- - No backend dependency — content is bundled at build time or fetched as static text
- Test Spec
- - Verify /worklog route renders
- - Verify content matches HISTORY.md

### Feature: Fox Engine — Event Generator
- ID: F-008
- Status: Done
- Description
- - Standalone service that generates random observations every 30 seconds
- - Pushes events via HTTP POST to backend API (`POST /api/observations`)
- - Does not access the database directly — backend is the single writer
- - Uses predefined locations (grid 3x3), random fox_ids, colors, prey, suspicion levels
- User Flow
- - Start fox-engine → generates event every 30s → POST to backend → appears in UI
- - Frontend picks up new events on next poll
- Technical Notes
- - Located at services/fox-engine/
- - Plain TypeScript + tsx, no Nx integration
- - No direct DB access — communicates via HTTP (axios or fetch)
- - setInterval at 30,000ms
- - Random generation: picks random location (1-9), random color, random fox_id from pool, random suspicion 1-10, random has_prey
- - Generates unique IDs with pattern `obs_XXX` (incrementing counter)
- Test Spec
- - Verify event is POSTed to backend every 30s
- - Verify POSTed event appears in GET /api/observations
- - Verify generated event has valid structure

### Feature: Database Seeds
- ID: F-009
- Status: Done
- Description
- - Three seed modes for database initialization
- - clean: empty database (only Location table seeded)
- - working: moderate set of random observations (20-50) with varied parameters
- - crash-test: 10,000 observations with varied parameters for stress testing
- User Flow
- - Run seed script with mode argument
- - DB populated accordingly → frontend reflects the data
- Technical Notes
- - Seed script in `apps/forest-foxes-backend/` or `packages/forest-foxes-shared-prisma/`
- - Uses Prisma createMany for bulk inserts (crash-test)
- - Clean seed: only inserts 9 Location records
- - Working seed: inserts 20-50 observations across random fox_ids
- - Crash-test: inserts 10,000 observations, batch size 500
- Test Spec
- - Verify clean seed: only Locations exist
- - Verify working seed: 20-50 observations exist
- - Verify crash-test: 10,000 observations exist

### Feature: Event Import via Backend API
- ID: F-010
- Status: Done
- Description
- - REST endpoint to import observations from a JSON payload
- - Validates each event before insertion
- - Returns count of successfully imported events
- User Flow
- - POST JSON array to /api/observations/import
- - Backend validates and inserts events
- - Frontend refreshes to show new events
- Technical Notes
- - POST /api/observations/import accepts array of observation objects
- - Validation: required fields, correct types, valid location_id (1-9)
- - Duplicate detection by id field
- Test Spec
- - Verify valid JSON is imported correctly
- - Verify invalid JSON returns 400
- - Verify duplicate ids are skipped

<!---------------------------------------------------------------------------------------------------->

## API Reference

### Observations

- `GET /api/observations` — List observations (query: `status`, `location_id`, `fox_id`, `tab`, `suspicion_min`, `sort`, `order`, `page`, `limit`)
- `GET /api/observations/:id` — Get single observation by ID
- `GET /api/observations/top-suspicious` — Top N most suspicious foxes (query: `limit`, `status`, `tab`)
- `POST /api/observations` — Create new observation
- `PATCH /api/observations/:id` — Update observation fields
- `PATCH /api/observations/:id/process` — Mark observation as processed
- `POST /api/observations/import` — Bulk import observations from JSON array
- `GET /api/observations/stream` — SSE stream for real-time observation updates (`created`, `updated`, `processed`, `deleted` events)
- `DELETE /api/observations/:id` — Delete an observation

### Statistics

- `GET /api/observations/stats` — Aggregated statistics (query: `tab`) — returns distribution by color, location, has_prey, suspicion level, pending vs processed counts

### Locations

- `GET /api/locations` — List all locations (9 grid cells)
- `GET /api/locations/:id` — Get single location with current observations

### Seeds

- `POST /api/seeds/clean` — Reset database to clean state (only locations)
- `POST /api/seeds/working` — Populate with working dataset (20-50 events)
- `POST /api/seeds/crash-test` — Populate with 10,000 events

### Health

- `GET /api/health` — Health check endpoint

<!---------------------------------------------------------------------------------------------------->

## Database Schema

### fox
| Column | Type | Description |
|---|---|---|
| id | String | Primary key (e.g., `fox_001`) |
| color | String | Fox color (рыжая, черная, серебристая, etc.) |
| created_at | DateTime | Auto-generated |

### observation
| Column | Type | Description |
|---|---|---|
| id | String | Primary key (e.g., `obs_001`) |
| fox_id | String | FK to fox.id |
| location_id | Int | FK to location.id (1-9) |
| has_prey | Boolean | Whether fox was seen with prey |
| suspicion_level | Int | Suspicion rating 1-10 |
| time | String | Observation time (HH:MM format) |
| status | String | `pending` or `processed` |
| created_at | DateTime | Auto-generated |
| updated_at | DateTime | Auto-generated |

### location
| Column | Type | Description |
|---|---|---|
| id | Int | Primary key (1-9) |
| name | String | Location name (e.g., "Северная поляна") |
| grid_row | Int | Row position in 3x3 grid (1-3) |
| grid_col | Int | Column position in 3x3 grid (1-3) |
| created_at | DateTime | Auto-generated |

<!---------------------------------------------------------------------------------------------------->

## State Management

| Store | Storage | Key |
|---|---|---|
| ObservationStore | in-memory | `observation-store` |
| FilterStore | in-memory | `filter-store` |
| TabStore | in-memory | `tab-store` |
| ViewModeStore | in-memory | `view-mode-store` |

### ObservationStore
- Holds list of all observations (pending and processed)
- Methods: `fetchAll()`, `fetchPending()`, `fetchProcessed()`, `updateObservation()`, `processObservation()`
- Auto-refreshes on poll interval or SSE event

### FilterStore
- Active filters: `location_id`, `fox_id`, `suspicion_min`, `suspicion_max`
- Methods: `setFilter()`, `clearFilters()`
- Table and map reactively filtered

### TabStore
- Active tab: `all` | `suspicious` | `processed`
- Methods: `setTab(tab)`, `resetTab()`
- Triggers data refetch for table, left donuts, right donuts
- On tab change: left donuts query tab-scoped all events, right donuts query tab-scoped processed events

### ViewModeStore
- Currently selected event (for modal)
- Active grid cell highlight
- Lower section scroll state

<!---------------------------------------------------------------------------------------------------->

*Future ideas:*
- Websocket/SSE for real-time event push from fox-engine (remove polling)
- Fox profile page — aggregate all observations per fox_id over time
- Timeline view — observations plotted on a chronological axis
- Export statistics as CSV/PDF report
- Dark mode toggle
- Desktop notifications for high-suspicion events
- Multi-user auth (forest ranger accounts)
