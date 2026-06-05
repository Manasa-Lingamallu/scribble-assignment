# Feature Specification: Gameplay Interaction

**Feature Branch**: `003-gameplay-interaction`

**Created**: 2026-06-05

**Status**: Draft

**Input**: User description: "Given a round is active with a drawer and guessers (all scores start at 0), When the drawer draws/clears the canvas and guessers submit their guesses, Then the drawing is visible on the drawer's screen; guesses are trimmed, case-insensitively compared, and empty ones rejected; the guess history is synced to all players via polling; correct guesses score 100 (incorrect add 0)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Drawer Canvas Interaction (Priority: P1)

The drawer sees a canvas area where they can draw (or perform some visual interaction) and clear the canvas. The drawing state is visible on the drawer's screen. This establishes the primary visual output of the game.

**Why this priority**: The canvas is the central visual element of the game — without it, guessers have nothing to react to.

**Independent Test**: Open a game as the drawer. The canvas area is visible and interactive (can draw or otherwise interact). The clear function resets the canvas. Non-drawer participants see the canvas area with a placeholder message.

**Acceptance Scenarios**:

1. **Given** a game in "playing" status, **When** the drawer views the GamePage, **Then** they see an interactive canvas area with a clear button.
2. **Given** the drawer is interacting with the canvas, **When** they click the clear button, **Then** the canvas resets to a blank state.
3. **Given** a game in "playing" status, **When** a guesser views the GamePage, **Then** they see a canvas placeholder showing "Waiting for the drawer to start drawing..." (canvas drawing visibility is established but full canvas sync is out of scope for this lab — the drawing is visible on the drawer's screen).

---

### User Story 2 - Guess Submission & Validation (Priority: P1)

Guessers can submit text guesses via a form. Guesses are sent to the backend, trimmed of whitespace, and compared case-insensitively against the secret word. Empty guesses are rejected with a clear error. Duplicate or previously submitted guesses are accepted (no duplicate filtering — each guess is recorded).

**Why this priority**: The core interactivity for guessers — without submission and validation, no one can win.

**Independent Test**: Submit a guess matching the secret word (case-insensitive) — it is recorded as correct. Submit an empty guess — it is rejected. Submit a guess with leading/trailing whitespace — it is trimmed before comparison.

**Acceptance Scenarios**:

1. **Given** a guesser on the GamePage, **When** they submit a guess that matches the secret word (case-insensitive, trimmed), **Then** the guess is recorded as correct and scores 100 points.
2. **Given** a guesser on the GamePage, **When** they submit an empty or whitespace-only guess, **Then** the guess is rejected with a "Guess cannot be empty" error.
3. **Given** a guesser on the GamePage, **When** they submit a guess that does not match the secret word, **Then** the guess is recorded as incorrect and scores 0 points.
4. **Given** a guesser on the GamePage, **When** they submit a guess with leading or trailing whitespace, **Then** the guess is trimmed before comparison (e.g., "  ROCKET  " matches "rocket").

---

### User Story 3 - Guess History & Scoring Sync (Priority: P2)

All players see the guess history updated via polling. Each guess shows the guesser's name, the guess text, and whether it was correct (or marked as such). Scores are computed server-side and reflected in the participant list. The drawer also sees the guess history so they know when someone guesses correctly.

**Why this priority**: Without guess history visible to all, players have no feedback loop and the game lacks transparency.

**Independent Test**: Guesser A submits an incorrect guess and guesser B submits a correct guess. Both the drawer and all guessers see both guesses in the history after the next poll cycle. Guesser B's score is updated to 100.

**Acceptance Scenarios**:

1. **Given** any participant on the GamePage, **When** a guess is submitted by any guesser, **Then** the guess appears in the history for all participants within the next polling cycle (~2s).
2. **Given** a guesser submits a correct guess, **When** the guess history updates, **Then** the guesser's score is 100 in the participant list.
3. **Given** a guesser submits an incorrect guess, **When** the guess history updates, **Then** the guesser's score remains 0.
4. **Given** multiple guesses are submitted, **When** the guess history is viewed, **Then** guesses appear in chronological order with the guesser's name and the guess text.

---

### Edge Cases

- What happens when a guesser submits the exact same correct guess as another guesser? Both guesses are recorded independently — each guesser scores 100 if their individual guess is correct.
- What happens when the drawer submits a guess? The drawer should not see a guess input form — only guessers can submit guesses (enforced by the UI).
- What happens when a guess is submitted after the game ends? Out of scope — only one round with no end condition is specified.
- What happens when a participant submits a guess with only whitespace? It is trimmed to empty and rejected.
- What happens when a previously correct guesser submits another guess? Each submission is evaluated independently against the secret word.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The GamePage MUST display an interactive canvas area for the drawer with a clear button.
- **FR-002**: The canvas clear button MUST reset the canvas to a blank state.
- **FR-003**: Guessers MUST see a canvas placeholder when the drawer has not interacted yet.
- **FR-004**: The system MUST accept guess submissions via a POST endpoint.
- **FR-005**: Guesses MUST be trimmed of leading and trailing whitespace before comparison.
- **FR-006**: Guesses MUST be compared case-insensitively against the secret word.
- **FR-007**: Empty or whitespace-only guesses MUST be rejected with a "Guess cannot be empty" error.
- **FR-008**: A guess matching the secret word MUST be recorded as correct.
- **FR-009**: A guess not matching the secret word MUST be recorded as incorrect.
- **FR-010**: A correct guess MUST award 100 points to the guesser.
- **FR-011**: The room snapshot MUST include a guess history array with each guess's participant name, text, and correctness.
- **FR-012**: The room snapshot MUST include each participant's current score.
- **FR-013**: Guess history MUST be synced to all players via the existing polling mechanism.
- **FR-014**: The drawer MUST see the guess history but MUST NOT have a guess input form.

### Key Entities

- **Guess**: A submission from a participant containing the guess text, the participant's ID and name, a boolean for correctness, and a timestamp.
- **Canvas**: A visual drawing area visible to the drawer for creating and clearing drawings.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A drawer can draw on and clear the canvas within 1 second of clicking the clear button.
- **SC-002**: A guess matching the secret word (case-insensitive) is correctly identified and scores 100 points in under 1 second.
- **SC-003**: An empty or whitespace-only guess produces an inline error within 1 second of submission.
- **SC-004**: All players see a new guess in the history within 3 seconds of submission (via polling).
- **SC-005**: All existing unit tests pass; new tests cover guess validation, scoring, and empty rejection.

## Assumptions

- Canvas drawing is implemented as a simple HTML Canvas element with basic drawing capabilities (freehand drawing + clear). Full canvas sync across clients is out of scope — only the drawer's screen shows the drawing state.
- Scores are tracked per participant as a number, starting at 0.
- No player limit — any number of guessers can be in a room.
- A guesser can submit multiple guesses; each is evaluated independently.
- The drawer role and secret word remain fixed throughout the single round.

## Explicitly Out of Scope

The following items are intentionally excluded. Do not build them.

**Technical**: WebSockets / real-time sync; Databases / persistent storage; Authentication / accounts / sessions; Deployment / hosting / CI pipelines; Docker / containerization; New state-management or routing libraries.

**Game features**: Multiple rounds; Drawer rotation; Round timers / countdowns; Speed or drawer bonuses; Custom or random word packs; Spectator mode; Room moderation (kick / mute); Room passwords or invite links.

**Process**: Rewriting the starter from scratch; Adding top-level dependencies not justified by this spec; Refactoring unrelated code.
