# Roadmap

Priority-ordered phases linking project features and epics.

<!---------------------------------------------------------------------------------------------------->

## List
1. **Testing and Fixes** — Manual testing of all features and bug resolution

<!---------------------------------------------------------------------------------------------------->

### Testing and Fixes
- Status: In Progress
- Epics: epic-testing-fixes
- Features:

Manual testing of all 12 features across backend and frontend. Verification of CRUD, analytics, map, modal, import, seeds, fox-engine, and worklog. Fix all discovered issues. Final typecheck and lint verification.

## Completed

### Auxiliary Services
- Status: Done
- Epics: epic-fox-engine, epic-ai-worklog
- Features: F-007, F-008

Standalone fox-engine generating random observations every 30 seconds via HTTP POST to backend with retry logic. AI worklog page at /worklog with content from HISTORY.md using shadcn Typography.

### Analytics Dashboard
- Status: Done
- Epics: epic-charts-analysis
- Features: F-005, F-011, F-012

Left donut charts (color, location, has_prey), summary card (unique foxes, avg suspicion, top suspect), right suspicion donut, top 5 fox ranking with highlighted leader, factor impact table (prey and color correlation with suspicion bars). All reactive to tab changes.

### Event Management
- Status: Done
- Epics: epic-forest-map, epic-event-sidebars, epic-table-tabs
- Features: F-001, F-002, F-003, F-004, F-006

Interactive 3x3 forest map with animated cell highlights, left sidebar with pending events and JSON import button, right sidebar with processed events, event detail modal with field editing and status toggle, tabbed table with three views.

### Frontend Shell
- Status: Done
- Epics: epic-frontend-scaffold
- Features:

Vite config with API proxy, TypeScript path aliases, React Router, four Zustand stores (Observation, Filter, Tab, ViewMode), shadcn/ui setup, ThreeColumnLayout component. The UI skeleton.

### Backend Data
- Status: Done
- Epics: epic-backend-observations, epic-backend-analytics, epic-backend-seeds-import
- Features: F-009, F-010

Full CRUD for observations, aggregated statistics with tab-scoped queries, top-suspicious endpoint, JSON import endpoint, and three seed modes (clean, working, crash-test). The complete data API.

### Foundation
- Status: Done
- Epics: epic-workspace, epic-shared-prisma, epic-backend-scaffold
- Features:

Monorepo directories, Nx targets, Prisma schema with Location/Fox/Observation models, NestJS app with PrismaModule and health check. All infrastructure needed before any feature code.
