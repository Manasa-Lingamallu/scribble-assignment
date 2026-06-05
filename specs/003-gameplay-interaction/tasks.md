---

description: "Task list for Gameplay Interaction feature"

---

# Tasks: Gameplay Interaction

**Input**: Design documents from `/specs/003-gameplay-interaction/`

**Prerequisites**: plan.md (required), spec.md (required for user stories)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No new project setup needed — all changes extend existing code.

- [ ] T001 Review existing codebase — read models/game.ts, services/roomStore.ts, api/rooms.ts, api/schemas.ts, frontend GamePage.tsx, api.ts, roomStore.ts, and existing related tests

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend changes that all user stories depend on.

- [ ] T002 [P] [US2/US3] Add `Guess` interface and `score` field to `Participant` in `backend/src/models/game.ts` — Guess: `{ participantId: string, participantName: string, text: string, isCorrect: boolean, createdAt: string }`
- [ ] T003 [P] [US2/US3] Add `guesses: Guess[]` field to `Room` model in `backend/src/models/game.ts`
- [ ] T004 [P] [US2/US3] Add `guesses: Guess[]` and per-participant `score: number` to `RoomSnapshot` in `backend/src/models/game.ts`
- [ ] T005 [US2/US3] Implement `submitGuess(roomCode: string, participantId: string, text: string)` in `backend/src/services/roomStore.ts` — validates participant exists and is a guesser (not the drawer), trims text, rejects empty, compares case-insensitively against `room.secretWord`, records guess with correctness, updates participant score if correct
- [ ] T006 [P] [US2/US3] Update `toRoomSnapshot` in `backend/src/services/roomStore.ts` to include `guesses[]` and participant scores
- [ ] T007 [P] [US2] Add guess request validation schema in `backend/src/api/schemas.ts` — `{ participantId: z.string(), text: z.string().trim().min(1, "Guess cannot be empty") }`
- [ ] T008 [P] [US2] Add `POST /rooms/:code/guess` endpoint in `backend/src/api/rooms.ts` — validates body via Zod schema, calls `submitGuess`, returns updated room snapshot

**Checkpoint**: Foundation ready — backend supports guess submission, validation, and scoring.

---

## Phase 3: User Story 1 - Drawer Canvas Interaction (Priority: P1) 🎯 MVP

**Goal**: The drawer sees an interactive canvas with drawing and clear capabilities.

**Independent Test**: Start a game as drawer. Canvas area is visible with drawing functionality. Clear button resets canvas. Non-drawers see a placeholder message.

### Implementation for User Story 1

- [ ] T009 [US1] Add a basic HTML Canvas element to `frontend/src/pages/GamePage.tsx` inside the Canvas card — enable freehand drawing via mouse events (mousedown, mousemove, mouseup, mouseleave)
- [ ] T010 [US1] Add a "Clear Canvas" button in the Canvas card that wipes the canvas context — visible only to the drawer
- [ ] T011 [US1] Show "Waiting for the drawer to start drawing..." placeholder text inside the Canvas card when the viewer is a guesser (already partially implemented from feature 002, verify correct message)
- [ ] T012 [US1] Add any needed CSS styles for the canvas element in `frontend/src/styles/app.css` (cursor, border, responsive sizing)

**Checkpoint**: US1 complete — drawer can draw and clear the canvas; guessers see a placeholder.

---

## Phase 4: User Story 2 - Guess Submission & Validation (Priority: P1)

**Goal**: Guessers can submit guesses; backend validates, trims, and compares case-insensitively; empty guesses rejected.

**Independent Test**: Submit a correct guess (case-insensitive) — recorded as correct and scores 100. Submit empty guess — rejected with inline error.

### Implementation for User Story 2

- [ ] T013 [P] [US2] Add `submitGuess` method to `frontend/src/services/api.ts` — `POST /rooms/:code/guess` with `{ participantId, text }` in body
- [ ] T014 [P] [US2] Add `submitGuess` action to `frontend/src/state/roomStore.ts` — calls API, updates room snapshot on success, handles errors
- [ ] T015 [US2] Update `frontend/src/pages/GamePage.tsx` — show `GuessForm` only to guessers (already partially done from feature 002, verify); wire guess submission to `roomStore.submitGuess`
- [ ] T016 [US2] Add inline error display for empty guess rejection in the GuessForm component (or in GamePage)
- [ ] T017 [P] [US2] Add tests in `backend/src/services/roomStore.test.ts` — test guess validation (empty rejection, trimming, case-insensitive match) and scoring
- [ ] T018 [P] [US2] Add tests in `backend/src/api/schemas.test.ts` — test guess schema validation (empty/whitespace text rejected)

**Checkpoint**: US2 complete — guess submission, validation, and scoring work correctly.

---

## Phase 5: User Story 3 - Guess History & Scoring Sync (Priority: P2)

**Goal**: All players see the guess history and updated scores via polling.

**Independent Test**: Guesser A submits incorrect guess, guesser B submits correct guess. Both appear in history for all players via polling. Guesser B's score is 100.

### Implementation for User Story 3

- [ ] T019 [P] [US3] Update `frontend/src/services/api.ts` — add `guesses: Guess[]` and `score: number` on participants to `RoomSnapshot` type
- [ ] T020 [US3] Update `frontend/src/pages/GamePage.tsx` — add a "Guess History" card that renders the list of guesses (participant name, guess text, correct/incorrect indicator)
- [ ] T021 [US3] Update the Scoreboard component (or GamePage) to display each participant's current score
- [ ] T022 [P] [US3] Add tests in `backend/src/services/roomStore.test.ts` — test that guess history and scores are included in snapshot
- [ ] T023 [P] [US3] Update `frontend/src/services/api.test.ts` — update mock responses with guesses and scores fields

**Checkpoint**: US3 complete — guess history and scores are visible to all players via polling.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup.

- [ ] T024 [P] Run `cd backend && npm test` — ensure all tests pass
- [ ] T025 [P] Run `cd frontend && npm test` — ensure all tests pass
- [ ] T026 Run both servers and manually verify the full scenario end-to-end: create room, join, start game, draw on canvas, submit guesses, verify scoring and history

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — code review only
- **Foundational (Phase 2)**: No dependencies on other phases — blocks US1, US2, US3
- **US1 (Phase 3)**: Can start after Phase 1 — minimal backend dependency (already has game status "playing")
- **US2 (Phase 4)**: Depends on Foundational (Phase 2) — needs guess backend logic
- **US3 (Phase 5)**: Depends on US2 (needs guess history from backend) — can start after T018
- **Polish (Final Phase)**: Depends on all user stories being complete

### Within Each User Story

- Backend models before services
- Services before API endpoints
- Backend endpoints before frontend types
- Frontend types before store actions
- Store actions before page components

### Parallel Opportunities

- T002 + T003 + T004 can run in parallel (model additions in same file)
- T006 (snapshot update) can run alongside T005 (service logic)
- T007 + T008 (schema + endpoint) depend on T005 but can be drafted in parallel
- T013 + T014 (frontend API + store) can run in parallel
- T017 + T018 (test files) can run in parallel with each other and with frontend work
- US1 (Phase 3) can run in parallel with Phase 2 foundational work (it only needs existing game status)
- All test tasks marked [P] can run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (model changes)
2. Complete Phase 3: User Story 1 (canvas interaction)
3. **STOP and VALIDATE**: Drawer can draw and clear canvas

### Incremental Delivery

1. Complete Foundational → Foundation ready
2. Add User Story 1 → Test independently → Canvas interaction MVP!
3. Add User Story 2 → Test independently → Guess submission and validation
4. Add User Story 3 → Test independently → Guess history and scoring sync
5. Each story adds value without breaking previous stories
