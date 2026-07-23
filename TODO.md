# test-forest-foxes TODO

## epic-workspace | Nx Monorepo and Project Scaffold
- [DONE] Create apps/forest-foxes-frontend directory with project.json, package.json, tsconfig
- [DONE] Create apps/forest-foxes-backend directory with project.json, package.json, tsconfig
- [DONE] Create packages/forest-foxes-shared-prisma directory with project.json, package.json, tsconfig
- [DONE] Create services/fox-engine directory with package.json, tsconfig
- [DONE] Add forest-foxes ports to mise.toml (frontend 3020, backend 8020)
- [DONE] Add forest-foxes DB path to mise.toml
- [DONE] Configure biome.json for new workspace packages
- Add npm scripts in root package.json for forest-foxes apps (optional — nx targets suffice)
- [DONE] Verify nx run-many succeeds across existing + new projects

## epic-shared-prisma | Shared Prisma Schema and Client Package
- [DONE] Define Location model (id, name, grid_row, grid_col, created_at)
- [DONE] Define Fox model (id, color, created_at)
- [DONE] Define Observation model (id, fox_id, location_id, has_prey, suspicion_level, time, status, created_at, updated_at)
- [DONE] Configure prisma.config.ts with defineConfig API
- [DONE] Set generator output to src/generated/prisma
- [DONE] Run prisma generate to produce client code
- [DONE] Implement createPrismaClient factory in src/index.ts
- [DONE] Export PrismaClient type and model types from src/index.ts
- [DONE] Add db:push and db:generate nx targets in project.json

## epic-backend-scaffold | NestJS Backend Bootstrap
- [DONE] Bootstrap NestJS app in main.ts with /api global prefix and CORS
- [DONE] Create PrismaModule and PrismaService using shared-prisma
- [DONE] Create AppModule with global ValidationPipe (whitelist, transform)
- [DONE] Configure Vite proxy in forest-foxes-frontend to point at backend port
- [DONE] Add health check endpoint GET /api/health
- [DONE] Set up project.json with dev, lint, typecheck nx targets

## epic-backend-observations | Observation CRUD Endpoints
- [DONE] Create ObservationsModule, ObservationsController, ObservationsService
- [DONE] Implement GET /api/observations with query params (status, location_id, fox_id, page, limit)
- [DONE] Implement GET /api/observations/:id for single observation
- [DONE] Implement POST /api/observations with DTO validation
- [DONE] Implement PATCH /api/observations/:id for field updates
- [DONE] Implement PATCH /api/observations/:id/process for status change
- [DONE] Implement DELETE /api/observations/:id
- [DONE] Add CreateObservationDto, UpdateObservationDto with class-validator
- [DONE] Handle fox auto-creation on POST if fox_id does not exist

## epic-backend-analytics | Statistics and Suspicion Analysis Endpoints
- [DONE] Implement GET /api/observations/stats with tab query param
- [DONE] Aggregation by color (count, avg suspicion per color)
- [DONE] Aggregation by location (count per location)
- [DONE] Aggregation by has_prey (count, avg suspicion per prey status)
- [DONE] Aggregation by suspicion level (distribution buckets)
- [DONE] Pending vs processed counts per scoped data
- [DONE] Implement GET /api/observations/top-suspicious with limit, status, tab params
- [DONE] GROUP BY fox_id with AVG suspicion and latest observation details
- [DONE] Implement GET /api/locations list and single endpoints

## epic-backend-seeds-import | Database Seeds and JSON Import
- [DONE] Implement seed script for clean mode (insert 9 Location records only)
- [DONE] Implement seed script for working mode (20-50 random observations)
- [DONE] Implement seed script for crash-test mode (10,000 observations)
- [DONE] Add POST /api/seeds/clean, /api/seeds/working, /api/seeds/crash-test endpoints
- [DONE] Implement POST /api/observations/import for JSON array payload
- [DONE] Add validation for imported events (required fields, types, location_id range)
- [DONE] Add duplicate detection by observation id field
- [DONE] Return count of successfully imported events

## epic-fox-engine | Standalone Event Generator Service
- [DONE] Create services/fox-engine/src/index.ts entry point
- [DONE] Implement HTTP client (axios or fetch) to POST to backend
- [DONE] Implement setInterval loop at 30,000ms
- [DONE] Define random generation pool: 10 fox_ids, 4 colors, 9 locations, suspicion 1-10, random has_prey
- [DONE] Generate unique observation IDs with incrementing counter pattern obs_XXX
- [DONE] Handle backend unavailability with retry and logging
- [DONE] Add package.json scripts for dev and start

## epic-frontend-scaffold | Frontend Bootstrap with Routing and Stores
- [DONE] Create Vite config with /api proxy to backend
- [DONE] Configure tsconfig with path aliases for mg-* packages
- [DONE] Set up main.tsx with React, Router, and global styles
- [DONE] Create page components: HomePage, WorklogPage
- [DONE] Set up React Router with routes / and /worklog
- [DONE] Create ObservationStore (fetchAll, fetchPending, fetchProcessed, update, process)
- [DONE] Create FilterStore (location_id, fox_id, suspicion_min, suspicion_max)
- [DONE] Create TabStore (activeTab: all | suspicious | processed, setTab, resetTab)
- [DONE] Create ViewModeStore (selectedEvent, activeCell, scrollState)
- [DONE] Install and configure shadcn/ui components via mg-ui-shadcn-4
- [DONE] Create ThreeColumnLayout component for upper and lower sections

## epic-forest-map | Interactive 3x3 Forest Map
- [DONE] Create ForestMap component with CSS Grid 3x3 layout
- [DONE] Load 9 Location records and render as grid cells
- [DONE] Add animated highlight to cells with active observations
- [DONE] Color cell highlights based on average suspicion level per location
- [DONE] Implement click handler to filter observations by location
- [DONE] Wire cell click to FilterStore location_id filter
- [DONE] Add persistent border color per cell based on avg suspicion
- [DONE] Add tooltip showing cell location name, event count, and avg suspicion

## epic-event-sidebars | Event Inbox, Processed Sidebar, and Detail Modal
- [DONE] Create EventInbox component (left sidebar, pending events list)
- [DONE] Add Import JSON button above EventInbox with file picker
- [DONE] Call POST /api/observations/import with file contents on selection
- [DONE] Show success count or error toast after import
- [DONE] Create ProcessedEvents component (right sidebar, processed events list)
- [DONE] Create EventItem component (fox_id, color, location, suspicion, time)
- [DONE] Create EventDetailModal with all editable fields
- [DONE] Add Mark as Processed button in modal
- [DONE] Add Save button to persist field edits via PATCH
- [DONE] Implement auto-refresh polling for new events from fox-engine
- [DONE] Style processed items differently (muted colors, checkmark icon)
- [DONE] Handle empty states for both sidebars
- [DONE] Use mg-ui-shadcn-4 ScrollArea and Dialog components

## epic-table-tabs | Tabbed Events Table
- [DONE] Create tab bar component with three tabs (Все события, Самые подозрительные, Обработанные)
- [DONE] Wire TabStore to tab bar clicks
- [DONE] Create EventsTable component using shadcn Table
- [DONE] Configure table columns: id, fox_id, location, color, has_prey, suspicion_level, time, status
- [DONE] Fetch data per active tab via TabStore-driven queries
- [DONE] Implement column sorting
- [DONE] Implement row click to open EventDetailModal
- [DONE] Wire tab switch to update table data + trigger sidebar recompute

## epic-charts-analysis | Donut Charts, Summary Card, and Factor Impact
- [DONE] Create donut chart component using recharts or shadcn chart
- [DONE] Implement left donuts: distribution by color, location, has_prey
- [DONE] Implement right donut: suspicion level distribution
- [DONE] Create Summary Card component (unique foxes, total obs, avg suspicion, top suspect)
- [DONE] Create Top 5 ranking table component (rank, fox_id, avg suspicion, count, last seen, last location)
- [DONE] Highlight #1 fox with badge and reason tooltip
- [DONE] Create Factor Impact table (avg suspicion by prey status and by color with visual bars)
- [DONE] Wire all components to TabStore for reactive recompute
- [DONE] Handle empty states for all chart and analysis blocks
- [DONE] Add tooltips to donut segments showing count and percentage

## epic-ai-worklog | AI Worklog Page
- [DONE] Create WorklogPage component at /worklog route
- [DONE] Format AI worklog content from HISTORY.md into clean typography layout
- [DONE] Use mg-ui-shadcn-4 typography components (heading, paragraph, list)
- [DONE] Add navigation link to WorklogPage in the UI (header or menu)
- [DONE] Ensure no backend dependency — content is static

## epic-testing-fixes | Manual Testing and Bug Fixes
- [DONE] Run backend and frontend dev servers
- [DONE] Test create observation flow
- [DONE] Test edit and process observation flow
- [DONE] Test import JSON flow
- [DONE] Test seed endpoints (clean, working, crash-test)
- [DONE] Test stats and top-suspicious endpoints
- [DONE] Test map interaction (click cell filter)
- [DONE] Test tab switching (all / suspicious / processed)
- [DONE] Test analytics donuts and summary card reactivity
- [DONE] Test worklog page rendering
- [DONE] Test fox-engine event generation
- [DONE] Test lower section table sorting
- [DONE] Test empty states for all components
- [DONE] Fix all discovered issues
- [DONE] Final typecheck and lint verification
