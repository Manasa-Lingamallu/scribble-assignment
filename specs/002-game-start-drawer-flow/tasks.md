---

description: "Task list for Game Start & Drawer Flow feature"

---

# Tasks: Game Start & Drawer Flow

**Input**: Design documents from `/specs/002-game-start-drawer-flow/`

**Prerequisites**: plan.md (required), spec.md (required for user stories)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No new project setup needed — all changes extend existing code.

- [ ] T001 Review existing codebase — read models/game.ts, services/roomStore.ts, api/rooms.ts, frontend GamePage.tsx, api.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend changes that both US1 and US2 depend on.

- [ ] T002 [P] [US1] Add `drawerParticipantId: string` and `secretWord: string` to Room model in `backend/src/models/game.ts`
- [ ] T003 [P] [US1] Add `drawerParticipantId: string`, `secretWord?: string`, and `role: ParticipantRole` to RoomSnapshot model in `backend/src/models/game.ts`
- [ ] T004 [US1] Update the start game logic in `backend/src/services/roomStore.ts` to set `drawerParticipantId` to the host's ID and `secretWord` to `STARTER_WORDS[0]` when status changes to "playing"
- [ ] T005 [US1] Update `toRoomSnapshot` in `backend/src/services/roomStore.ts` to:
  - Include `drawerParticipantId` always
  - Include `secretWord` only when `viewerParticipantId === room.drawerParticipantId`
  - Compute `role` as `"drawer"` when viewer is the drawer, else `"guesser"`
- [ ] T006 [P] [US1/US2/US3] Update `backend/src/services/roomStore.test.ts` — tests for drawer assignment, word visibility, and name trimming

**Checkpoint**: Foundation ready — backend supports drawer tracking, word selection, and conditional visibility.

---

## Phase 3: User Story 1 - Drawer Assignment & Word Selection (Priority: P1) 🎯 MVP

**Goal**: When the game starts, the host becomes the drawer and a secret word is deterministically selected.

**Independent Test**: Create room as Alice, join as Bob, start game via PATCH. Fetch snapshot as Alice — response includes `drawerParticipantId` matching Alice's ID and `secretWord` set to "rocket". Fetch snapshot as Bob — `secretWord` is absent.

### Implementation for User Story 1

- [ ] T007 [US1] Update `backend/src/api/rooms.ts` start endpoint to return drawer info and secret word in the response snapshot
- [ ] T008 [US1] Update `frontend/src/services/api.ts` — add `drawerParticipantId`, `secretWord?`, and `role` to `RoomSnapshot` type
- [ ] T009 [US1] Update `frontend/src/services/api.test.ts` — update mock responses with the new RoomSnapshot fields

**Checkpoint**: US1 complete — drawer assignment and word selection work correctly. Backend exposes drawer info conditionally.

---

## Phase 4: User Story 2 - Drawer Word Visibility on Game Page (Priority: P1)

**Goal**: The GamePage shows the secret word to the drawer and identifies the drawer to all participants.

**Independent Test**: Open tab A as host (drawer), tab B as guesser. Tab A sees "Your secret word: rocket". Tab B sees "Waiting for the drawer to draw" and "Drawer: Alice".

### Implementation for User Story 2

- [ ] T010 [US2] Update `frontend/src/pages/GamePage.tsx` to:
  - Display the secret word in a prominent card when the viewer's role is "drawer"
  - Show a "Waiting for the drawer to draw" message when the viewer is a guesser
  - Identify the current drawer by name in the Player Info card
- [ ] T011 [US2] Add any needed CSS styles for the secret word reveal card in `frontend/src/styles/app.css`
- [ ] T012 [US2] Update `frontend/src/pages/GamePage.tsx` to add polling (every 2s) to keep the room state fresh

**Checkpoint**: US2 complete — drawer sees the word, guessers don't, and the drawer is identified.

---

## Phase 5: User Story 3 - Player Name Trimming (Priority: P2)

**Goal**: Player names are trimmed on create/join. Empty/whitespace-only names are rejected.

**Independent Test**: Create room with name "  Alice  " — stored name is "Alice". Create/join with name "" or "   " — rejected with "Player name cannot be empty".

### Implementation for User Story 3

- [ ] T013 [US3] Update `displayName` in `backend/src/services/roomStore.ts` to trim the input name before checking for emptiness
- [ ] T014 [US3] Add/update tests in `backend/src/services/roomStore.test.ts` for name trimming behavior

**Checkpoint**: US3 complete — player names are trimmed and empty names are rejected.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup.

- [ ] T015 [P] Run `cd backend && npm test` — ensure all tests pass
- [ ] T016 [P] Run `cd frontend && npm test` — ensure all tests pass
- [ ] T017 Run both servers and manually verify the full scenario end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — code review only
- **Foundational (Phase 2)**: No dependencies on other phases — blocks US1, US2, US3
- **US1 (Phase 3)**: Depends on Foundational — can start after T006
- **US2 (Phase 4)**: Depends on Foundational + US1 (needs drawer info in snapshot) — can start after T008
- **US3 (Phase 5)**: Depends on Foundational — can start in parallel with US1
- **Polish (Final Phase)**: Depends on all user stories being complete

### Within Each User Story

- Backend models before services
- Services before API endpoints
- Backend endpoints before frontend types
- Frontend types before page components

### Parallel Opportunities

- T002 + T003 can run in parallel (model field additions in same file)
- T006 (tests) can start as soon as T002-T005 are drafted
- US3 (Phase 5) can run in parallel with US1 (Phase 3) since name trimming is independent of drawer logic
- All test tasks marked [P] can run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (drawer model + word selection)
2. Complete Phase 3: User Story 1 (drawer assignment + word selection)
3. **STOP and VALIDATE**: Drawer assignment and word visibility via API works

### Incremental Delivery

1. Complete Foundational → Foundation ready
2. Add User Story 1 → Test independently → MVP!
3. Add User Story 2 → Test independently → Drawer word visible on UI
4. Add User Story 3 → Test independently → Name trimming
5. Each story adds value without breaking previous stories
