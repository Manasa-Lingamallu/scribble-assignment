---

description: "Task list for Room Setup & Lobby feature"

---

# Tasks: Room Setup & Lobby

**Input**: Design documents from `/specs/001-room-setup-lobby/`

**Prerequisites**: plan.md (required), spec.md (required for user stories)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No new project setup needed — all changes extend existing code.

- [ ] T001 Review existing codebase — read models/game.ts, services/roomStore.ts, api/rooms.ts, all frontend pages, state/roomStore.ts, services/api.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend changes that both US1 and US2 depend on.

- [ ] T002 [P] [US1/US2] Add `hostParticipantId: string` field to Room type in `backend/src/models/game.ts`
- [ ] T003 [P] [US1/US2] Add `isHost: boolean` field to RoomSnapshot type in `backend/src/models/game.ts`
- [ ] T004 [P] [US1/US2] Update `createParticipant` and `createRoom` in `backend/src/services/roomStore.ts` to set `hostParticipantId` to the creator's ID
- [ ] T005 [P] [US1/US2] Update `toRoomSnapshot` in `backend/src/services/roomStore.ts` to compute `isHost` by comparing `viewerParticipantId` against `hostParticipantId`
- [ ] T006 [P] [US1] Add player name validation (non-empty, non-whitespace) in `backend/src/api/schemas.ts` — update `createRoomSchema` and `joinRoomSchema` to use `z.string().trim().min(1)`
- [ ] T007 [P] [US1] Update `backend/src/api/schemas.test.ts` — add tests for empty/whitespace name rejection
- [ ] T008 [P] [US1/US2] Update `backend/src/services/roomStore.test.ts` — add tests for host tracking in createRoom and toRoomSnapshot

**Checkpoint**: Foundation ready — backend supports host tracking and name validation. User story implementation can begin.

---

## Phase 3: User Story 1 - Room Creation & Joining (Priority: P1) 🎯 MVP

**Goal**: Players can create and join rooms with validated names and codes, with clear error feedback for invalid inputs.

**Independent Test**: Open two browser tabs — create room in one, join with correct code in the other. Verify both appear in lobby. Verify empty code/name shows inline error.

### Implementation for User Story 1

- [ ] T009 [US1] Add empty/whitespace room code validation on the JoinRoomPage form (`frontend/src/pages/JoinRoomPage.tsx`) — reject before sending API request
- [ ] T010 [US1] Add empty/whitespace player name validation on CreateRoomPage (`frontend/src/pages/CreateRoomPage.tsx`) — reject before sending API request
- [ ] T011 [US1] Add empty/whitespace player name validation on JoinRoomPage (`frontend/src/pages/JoinRoomPage.tsx`) — reject before sending API request
- [ ] T012 [US1] Wire 404 "Room not found" error from joinRoom API into JoinRoomPage error display (`frontend/src/pages/JoinRoomPage.tsx`)

**Checkpoint**: US1 complete — room creation and joining works with validation on both frontend and backend. Invalid/empty inputs show clear errors.

---

## Phase 4: User Story 2 - Host & Start Game (Priority: P1)

**Goal**: Host is tracked, only host can start the game, minimum 2 players required.

**Independent Test**: Create room in tab A, join from tab B. Tab A shows enabled "Start Game" button. Tab B does not see the button. With 1 player, button is disabled.

### Implementation for User Story 2

- [ ] T013 [P] [US2] Add `PATCH /rooms/:code/start` endpoint in `backend/src/api/rooms.ts` — validates host identity and 2+ participant count, sets room status to `"playing"` (status string can be extended later)
- [ ] T014 [US2] Add `startGame` method to `frontend/src/services/api.ts` — `PATCH /rooms/:code/start` with `participantId` in body
- [ ] T015 [US2] Add `startGame` action to `frontend/src/state/roomStore.ts` — calls API, handles errors
- [ ] T016 [US2] Update `frontend/src/pages/LobbyPage.tsx` — conditionally render "Start Game" button only for host, disabled when <2 players; show "Waiting for host to start..." for non-hosts
- [ ] T017 [US2] Handle errors from startGame in LobbyPage (e.g., non-host trying to start, not enough players)

**Checkpoint**: US2 complete — host-only start button with 2-player minimum enforced on both frontend and backend.

---

## Phase 5: User Story 3 - Lobby Auto-Polling (Priority: P2)

**Goal**: Lobby auto-refreshes every ~2 seconds so participants see updates without manual refresh.

**Independent Test**: Open lobby in tab A, join from tab B — tab A shows new participant within ~2 seconds.

### Implementation for User Story 3

- [ ] T018 [US3] Add auto-polling to `frontend/src/state/roomStore.ts` — add `startPolling(intervalMs)` and `stopPolling()` methods using `setInterval` / `clearInterval`
- [ ] T019 [US3] Update `frontend/src/pages/LobbyPage.tsx` — call `startPolling(2000)` on mount, `stopPolling()` on unmount (via useEffect)
- [ ] T020 [US3] Update LobbyPage to show a non-blocking indicator ("Connection issue — retrying...") when polling fails (track via a new `pollingError` state or similar)
- [ ] T021 [US3] Remove the manual "Refresh Room" button from LobbyPage (no longer needed with auto-polling)

**Checkpoint**: US3 complete — lobby auto-polls at ~2s, stops on unmount, handles errors gracefully.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup.

- [ ] T022 [P] Run `cd backend && npm test` — ensure all existing and new tests pass
- [ ] T023 [P] Run `cd frontend && npm test` — ensure all existing and new tests pass
- [ ] T024 Run both servers and manually verify the full scenario end-to-end
- [ ] T025 Update `backend/src/api/schemas.test.ts` if any new schema validation tests are needed
- [ ] T026 Update `frontend/src/services/api.test.ts` with tests for the new `startGame` API method

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — code review only
- **Foundational (Phase 2)**: No dependencies on other phases — blocks both US1 and US2
- **US1 (Phase 3)**: Depends on Foundational (Phase 2) — can start after T008
- **US2 (Phase 4)**: Depends on Foundational (Phase 2) — can start in parallel with US1
- **US3 (Phase 5)**: Depends on US1 (needs a working lobby) — can start after T012
- **Polish (Final Phase)**: Depends on all user stories being complete

### Within Each User Story

- Backend models before services
- Services before API endpoints
- API endpoints before frontend services/stores
- Frontend stores before page components

### Parallel Opportunities

- T002 + T003 can run in parallel (model changes, different fields)
- T004 + T005 + T006 can run in parallel (different files)
- US1 (Phase 3) and US2 (Phase 4) can run in parallel once Phase 2 is complete
- All test tasks marked [P] can run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (host tracking + name validation)
2. Complete Phase 3: User Story 1 (creation + joining + validation)
3. **STOP and VALIDATE**: Create and join rooms works with proper validation

### Incremental Delivery

1. Complete Foundational → Foundation ready
2. Add User Story 1 → Test independently → MVP!
3. Add User Story 2 → Test independently → Host + start game
4. Add User Story 3 → Test independently → Auto-polling lobby
5. Each story adds value without breaking previous stories
