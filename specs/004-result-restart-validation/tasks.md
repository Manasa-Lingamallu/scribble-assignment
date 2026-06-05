---

description: "Task list for Result, Restart & Final Validation feature"

---

# Tasks: Result, Restart & Final Validation

**Input**: Design documents from `/specs/004-result-restart-validation/`

**Prerequisites**: plan.md (required), spec.md (required for user stories)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No new project setup needed — all changes extend existing code.

- [ ] T001 Review existing codebase — read models/game.ts, services/roomStore.ts, api/rooms.ts, frontend GamePage.tsx, LobbyPage.tsx, api.ts, roomStore.ts, and existing related tests

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend changes that all user stories depend on.

- [ ] T002 [P] [US1/US2] Add `"finished"` to `RoomStatus` type in `backend/src/models/game.ts`
- [ ] T003 [US1] Implement `endRound(roomCode: string, participantId: string)` in `backend/src/services/roomStore.ts` — validates room exists in "playing" status, validates participant is the host (only host can manually end), sets status to "finished", returns updated room
- [ ] T004 [US2] Implement `restartGame(roomCode: string, participantId: string)` in `backend/src/services/roomStore.ts` — validates room exists in "finished" status, validates participant is host, resets status to "lobby", clears `drawerParticipantId`, `secretWord`, `guesses`, `canvasDataUrl`, resets all participant scores to 0, returns updated room
- [ ] T005 [P] [US1] Add `PATCH /rooms/:code/end-round` endpoint in `backend/src/api/rooms.ts` — validates body via participantId, calls `endRound`, returns room snapshot
- [ ] T006 [P] [US2] Add `PATCH /rooms/:code/restart` endpoint in `backend/src/api/rooms.ts` — validates body via participantId, calls `restartGame`, returns room snapshot

**Checkpoint**: Foundation ready — backend supports round ending (auto on correct guess + manual) and restart with state clearing.

---

## Phase 3: User Story 1 - Round End & Result Display (Priority: P1) 🎯 MVP

**Goal**: The round ends when a correct guess is submitted (or host ends manually). All players see the result screen with the secret word revealed, final scores, and guess history.

**Independent Test**: Submit a correct guess — room status becomes "finished". Fetch the room snapshot — secretWord is visible to all, scores are final, guesses are listed.

### Implementation for User Story 1

- [ ] T007 [US1] Update `submitGuess` in `backend/src/services/roomStore.ts` — when the guess is correct, also set `room.status = "finished"` (auto-end on correct guess)
- [ ] T008 [P] [US1] Add `endRound` and `restartGame` methods to `frontend/src/services/api.ts` — `PATCH /rooms/:code/end-round` and `PATCH /rooms/:code/restart` with `{ participantId }` in body
- [ ] T009 [P] [US1] Add `endRound` action to `frontend/src/state/roomStore.ts` — calls API, updates room snapshot on success
- [ ] T010 [US1] Update `frontend/src/pages/GamePage.tsx` — detect `room.status === "finished"` via polling; when finished, render a `<ResultScreen>` component instead of the game layout
- [ ] T011 [US1] Create `frontend/src/components/ResultScreen.tsx` — displays:
  - The secret word (now revealed to all)
  - Final scores for all participants (sorted)
  - Full guess history (participant name, text, correct/incorrect)
  - "End Round" button visible only to the host (when round is still "playing")
- [ ] T012 [US1] Show "End Round" button for the host on the GamePage (visible during "playing" status) that calls `roomStore.endRound`
- [ ] T013 [P] [US1] Add tests in `backend/src/services/roomStore.test.ts` — test endRound (host can end, non-host rejected, unknown room, wrong status)

**Checkpoint**: US1 complete — round ends on correct guess or host action; result screen displays word, scores, and history.

---

## Phase 4: User Story 2 - Host Restart (Priority: P1)

**Goal**: The host can restart the game from the result screen, returning to lobby with participants preserved and round state cleared.

**Independent Test**: End a round, click "Restart Game" as host. Room status becomes "lobby". Participants list is preserved. Scores are 0. Drawer, word, guesses, canvas are all cleared.

### Implementation for User Story 2

- [ ] T014 [P] [US2] Add `restartGame` action to `frontend/src/state/roomStore.ts` — calls API, updates room snapshot on success
- [ ] T015 [US2] Update `frontend/src/components/ResultScreen.tsx` — show "Restart Game" button for the host (only when status is "finished"); show "Waiting for host to restart..." for non-hosts
- [ ] T016 [US2] Update `frontend/src/pages/GamePage.tsx` — when polling detects `room.status === "lobby"` and the previous status was "finished", redirect to `/lobby`
- [ ] T017 [P] [US2] Add tests in `backend/src/services/roomStore.test.ts` — test restartGame (clears round state, preserves participants, non-host rejected, unknown room)

**Checkpoint**: US2 complete — host can restart; participants and round state are handled correctly.

---

## Phase 5: User Story 3 - Polling-Based Result & Lobby Navigation (Priority: P2)

**Goal**: All participants automatically see the result screen when the round ends, and return to lobby on restart, all via polling.

**Independent Test**: Two tabs open (drawer + guesser). Guesser submits correct guess. Both tabs show result screen within 2s. Host clicks restart. Both tabs show lobby within 2s.

### Implementation for User Story 3

- [ ] T018 [US3] Update `frontend/src/pages/GamePage.tsx` — add status-change detection in the polling useEffect: when status transitions to "finished", the component re-renders as ResultScreen; when status transitions to "lobby", navigate to "/lobby"
- [ ] T019 [US3] Ensure the polling interval continues on the result screen so non-hosts detect restart
- [ ] T020 [P] [US3] Update `frontend/src/services/api.test.ts` — add tests for `endRound` and `restartGame` API methods

**Checkpoint**: US3 complete — auto-navigation via polling works for both result screen and lobby return.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup.

- [ ] T021 [P] Run `cd backend && npm test` — ensure all tests pass
- [ ] T022 [P] Run `cd frontend && npm test` — ensure all tests pass
- [ ] T023 Run both servers and manually verify the full scenario end-to-end: start game, submit guesses, end round, see results, restart, verify lobby state

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — code review only
- **Foundational (Phase 2)**: No dependencies on other phases — blocks US1, US2
- **US1 (Phase 3)**: Depends on Foundational — can start after T006
- **US2 (Phase 4)**: Depends on US1 (needs ResultScreen to show restart button) — can start after T011
- **US3 (Phase 5)**: Depends on US1 and US2 (needs status transitions working) — can start after T017
- **Polish (Final Phase)**: Depends on all user stories being complete

### Within Each User Story

- Backend models before services
- Services before API endpoints
- Backend endpoints before frontend types
- Frontend types before store actions
- Store actions before page components

### Parallel Opportunities

- T002 (model change) can be done independently
- T003 + T004 (service functions) can be done in parallel
- T005 + T006 (endpoints) can be done in parallel
- T008 + T009 (frontend API + store) can be done in parallel
- T013 + T017 (test files) can be done in parallel with frontend work
- All test tasks marked [P] can run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (model + endpoints)
2. Complete Phase 3: User Story 1 (round end + result display)
3. **STOP and VALIDATE**: Round ends correctly and result screen displays

### Incremental Delivery

1. Complete Foundational → Foundation ready
2. Add User Story 1 → Test independently → Round end + result MVP!
3. Add User Story 2 → Test independently → Host restart
4. Add User Story 3 → Test independently → Auto-navigation via polling
5. Each story adds value without breaking previous stories
