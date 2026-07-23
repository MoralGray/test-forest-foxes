# Test Plan — test-forest-foxes

## Project Info
- Language: TypeScript 5.9
- Framework: NestJS 11 (backend), React 19 + Vite 8 (frontend)
- Test Runner: vitest (v4.1)
- Test Framework: @testing-library/react + @testing-library/jest-dom (frontend only)
- Source files: 36
- Existing tests: 0 files (0% coverage)
- CI command: `npx nx run-many --target=test --projects=forest-foxes-backend,forest-foxes-frontend`

## Existing test files
None.

## Modules without tests

### P0 (core business logic)
| Module | Exports | LOC | Test type | Difficulty |
|---|---|---|---|---|
| apps/forest-foxes-backend/src/observations/observations-analytics.service.ts | stats, topSuspicious, findAllLocations, findLocation | 173 | Unit | Medium (needs Prisma mock) |
| apps/forest-foxes-backend/src/observations/observations.service.ts | create, findAll, findOne, update, process, remove | 164 | Unit | Medium (needs Prisma + SSE mock) |
| apps/forest-foxes-frontend/src/stores/observationStore.ts | useObservationStore (13 methods) | 177 | Unit | Medium (needs API mock) |
| apps/forest-foxes-backend/src/observations/observations.controller.ts | 14 route handlers | 118 | Integration | Hard (needs HTTP mock) |

### P1 (shared / important)
| Module | Exports | LOC | Test type | Difficulty |
|---|---|---|---|---|
| apps/forest-foxes-backend/src/observations/observations-import.service.ts | importObservations | 48 | Unit | Medium |
| apps/forest-foxes-backend/src/observations/observations-seed.service.ts | seedClean, seedWorking, seedCrashTest | 94 | Unit | Medium |
| apps/forest-foxes-backend/src/observations/sse.service.ts | SseService (emit, stream) | 29 | Unit | Easy |
| apps/forest-foxes-frontend/src/services/api.ts | api (get, post, patch, del) | 19 | Unit | Easy |
| apps/forest-foxes-frontend/src/hooks/useSseStream.ts | useSseStream | 83 | Unit | Medium |
| apps/forest-foxes-frontend/src/stores/filterStore.ts | useFilterStore | 21 | Unit | Easy |
| apps/forest-foxes-frontend/src/stores/tabStore.ts | useTabStore | 14 | Unit | Easy |
| apps/forest-foxes-frontend/src/stores/viewModeStore.ts | useViewModeStore | 16 | Unit | Easy |
| apps/forest-foxes-backend/src/observations/dto/create-observation.dto.ts | CreateObservationDto | 32 | Unit | Easy |
| apps/forest-foxes-backend/src/observations/dto/update-observation.dto.ts | UpdateObservationDto | 34 | Unit | Easy |

### P2 (nice to have)
| Module | LOC | Test type | Difficulty |
|---|---|---|---|
| apps/forest-foxes-frontend/src/components/forest/ForestMap.tsx | 63 | Component | Medium |
| apps/forest-foxes-frontend/src/components/events/EventInbox.tsx | 95 | Component | Medium |
| apps/forest-foxes-frontend/src/components/events/EventsTable.tsx | 84 | Component | Medium |
| apps/forest-foxes-frontend/src/components/events/ProcessedEvents.tsx | 64 | Component | Medium |
| apps/forest-foxes-frontend/src/components/events/EventDetailModal.tsx | 172 | Component | Hard |
| apps/forest-foxes-frontend/src/components/analytics/DonutChart.tsx | 53 | Component | Medium |
| apps/forest-foxes-frontend/src/components/analytics/TopFiveTable.tsx | 61 | Component | Easy |
| apps/forest-foxes-frontend/src/components/analytics/FactorImpactTable.tsx | 61 | Component | Easy |
| apps/forest-foxes-frontend/src/components/analytics/SummaryCard.tsx | 41 | Component | Easy |
| apps/forest-foxes-frontend/src/pages/HomePage.tsx | 130 | Component | Hard |
| apps/forest-foxes-frontend/src/pages/WorklogPage.tsx | 71 | Component | Easy |

## Module: apps/forest-foxes-backend/src/observations/observations-analytics.service.ts
Priority: P0
Test type: Unit
Difficulty: Medium

### stats(tab?)
- [ ] Happy: Returns all aggregated stats for no tab filter
- [ ] Tab: 'suspicious' filters to suspicionLevel >= 7
- [ ] Tab: 'processed' filters to status = 'processed'
- [ ] Empty DB: Returns zero counts and empty arrays
- [ ] Single observation: Returns correct single-entry stats
- [ ] Color stats: Maps fox colors correctly via Fox model
- [ ] Location stats: Resolves location names via Location model
- [ ] HasPrey stats: Groups by hasPrey boolean
- [ ] Suspicion buckets: Low (1-3), Medium (4-7), High (8-10) correctly counted
- [ ] Avg suspicion: Returns 0 when no observations exist
- [ ] Unique foxes: Correctly counts distinct foxes

### topSuspicious(limit?, status?, tab?)
- [ ] Happy: Returns top 5 by avg suspicion descending
- [ ] Limit: Respects custom limit parameter
- [ ] Status: Filters by status when provided
- [ ] Tab: Applies tab filter
- [ ] Empty: Returns empty array when no observations
- [ ] Includes lastLocation from latest observation
- [ ] Includes fox color from Fox model

### findAllLocations()
- [ ] Happy: Returns all locations ordered by id asc
- [ ] Empty: Empty array when no locations

### findLocation(id)
- [ ] Happy: Returns location with recent observations
- [ ] NotFound: Throws NotFoundException for invalid id

---

## Module: apps/forest-foxes-backend/src/observations/observations.service.ts
Priority: P0
Test type: Unit
Difficulty: Medium

### create(dto)
- [ ] Happy: Creates new observation with pending status
- [ ] Duplicate: Returns existing observation without SSE event
- [ ] Fox auto-creation: Creates fox if not exists
- [ ] Fox color update: Updates fox color if changed
- [ ] SSE emitted: Emits 'created' event for new records only

### findAll(query)
- [ ] Happy: Paginated list sorted by time desc
- [ ] Status filter: Filters by pending/processed
- [ ] Location filter: Filters by locationId
- [ ] Fox filter: Filters by foxId
- [ ] Suspicion min: Filters by minimum suspicion level
- [ ] Custom sort: Sorts by specified column
- [ ] Pagination: Defaults to page 1, limit 50
- [ ] Empty: Empty data array when no matches

### findOne(id)
- [ ] Happy: Returns observation with fox and location
- [ ] NotFound: Throws NotFoundException

### update(id, dto)
- [ ] Happy: Updates fields and emits SSE
- [ ] Fox auto-create on foxId change: Creates new fox
- [ ] Fox not found: Throws if foxId changed to non-existent
- [ ] NotFound: Throws for invalid id

### process(id)
- [ ] Happy: Sets status to 'processed', emits SSE
- [ ] NotFound: Throws for invalid id

### remove(id)
- [ ] Happy: Deletes and emits 'deleted' SSE
- [ ] NotFound: Throws for invalid id

---

## Module: apps/forest-foxes-frontend/src/stores/observationStore.ts
Priority: P0
Test type: Unit
Difficulty: Medium

### fetchAll(params?)
- [ ] Happy: Sets observations from API response
- [ ] Loading: Sets loading=true before fetch, false after
- [ ] Error: Sets error state on failure
- [ ] Params: Passes URLSearchParams correctly

### fetchPending()
- [ ] Happy: Fetches status=pending, stores in pending array
- [ ] Error: Logs to console but doesn't crash (known pattern — set error state too)

### fetchProcessed()
- [ ] Happy: Fetches status=processed, stores in processed array
- [ ] Error: Logs to console but doesn't crash

### fetchStats(tab?)
- [ ] Happy: Stores stats response
- [ ] Tab scope: Appends ?tab= parameter

### fetchTopSuspicious(limit?, status?, tab?)
- [ ] Happy: Stores topSuspicious array
- [ ] Params: Builds query string correctly

### createObservation(data)
- [ ] Happy: POSTs to /api/observations

### updateObservation(id, data)
- [ ] Happy: PATCHes to /api/observations/:id

### processObservation(id)
- [ ] Happy: PATCHes to /api/observations/:id/process

### deleteObservation(id)
- [ ] Happy: DELETEs /api/observations/:id

### importObservations(events)
- [ ] Happy: POSTs to /api/observations/import, returns {created, skipped}

### addPending(obs)
- [ ] Happy: Prepends to pending array

### addObservation(obs)
- [ ] Happy: Prepends to observations array

### moveToProcessed(obs)
- [ ] Happy: Removes from pending, prepends to processed

### updateInPlace(obs)
- [ ] Happy: Updates observation in all three arrays

### removeFromStore(id)
- [ ] Happy: Removes from all three arrays

---

## Module: apps/forest-foxes-backend/src/observations/observations-import.service.ts
Priority: P1
Test type: Unit
Difficulty: Medium

### importObservations(events)
- [ ] Happy: Creates new observations, returns created count
- [ ] Duplicate detection: Skips existing IDs, increments skipped
- [ ] Partial: Mix of new and existing — correct created/skipped
- [ ] Fox auto-creation: Creates fox for new observations
- [ ] SSE: Emits 'created' event with data:null
- [ ] Empty array: Returns {created: 0, skipped: 0}

---

## Module: apps/forest-foxes-backend/src/observations/observations-seed.service.ts
Priority: P1
Test type: Unit
Difficulty: Medium

### seedClean()
- [ ] Happy: Deletes all observations, foxes, locations, seeds 9 locations

### seedWorking()
- [ ] Happy: Seeds clean, creates 5 foxes, 30 random observations
- [ ] Mixed status: Some pending, some processed

### seedCrashTest()
- [ ] Happy: Seeds clean, creates 50 foxes, 10,000 observations in batches
- [ ] Batched: Creates in 500-record batches

---

## Module: apps/forest-foxes-backend/src/observations/sse.service.ts
Priority: P1
Test type: Unit
Difficulty: Easy

### emit(event)
- [ ] Happy: Emits event to all subscribers
- [ ] No subscribers: Emits without error

### stream()
- [ ] Happy: Returns Observable that receives events
- [ ] Late subscriber: Does not receive past events (Subject behavior)

---

## Module: apps/forest-foxes-frontend/src/services/api.ts
Priority: P1
Test type: Unit
Difficulty: Easy

### request(method, path, body?)
- [ ] GET: Sends GET request returns JSON
- [ ] POST: Sends POST with JSON body
- [ ] PATCH: Sends PATCH with JSON body
- [ ] DELETE: Sends DELETE request
- [ ] Error: Non-ok response throws error with body text
- [ ] No body: GET/DELETE omit Content-Type

### api.get/post/patch/del
- [ ] All methods: Each delegates to request with correct method

---

## Module: apps/forest-foxes-frontend/src/hooks/useSseStream.ts
Priority: P1
Test type: Unit
Difficulty: Medium

### useSseStream()
- [ ] Happy: Creates EventSource on mount
- [ ] Cleanup: Closes EventSource on unmount
- [ ] 'created' event: Calls addPending + addObservation + refreshAnalytics
- [ ] 'created' with null data: Calls fetchAll + fetchPending + fetchProcessed
- [ ] 'processed' event: Calls moveToProcessed + updateInPlace + refreshAnalytics
- [ ] 'updated' event: Calls updateInPlace + refreshAnalytics
- [ ] 'deleted' event: Calls removeFromStore + refreshAnalytics
- [ ] Malformed event: console.error without crashing
