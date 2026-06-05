# Feature Specification: Game Start & Drawer Flow

**Feature Branch**: `002-game-start-drawer-flow`

**Created**: 2026-06-05

**Status**: Draft

**Input**: User description: "Given a game is starting and player names are trimmed (empty/whitespace-only rejected with a message), When the first round begins, Then the host (or first player) becomes the clearly-identified drawer, and the secret word (deterministically selected from the starter list) is visible only to the drawer."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Drawer Assignment & Word Selection (Priority: P1)

When the host clicks "Start Game" and the room has at least 2 participants, the room status transitions to "playing". The host is assigned as the drawer for the first round. A secret word is deterministically selected from the starter word list (first word in the list). The backend exposes the drawer's participant ID and the secret word (to the drawer only) in the room snapshot.

**Why this priority**: Core game mechanic — without drawer assignment and word selection, no gameplay can begin.

**Independent Test**: Create a room as Alice, have Bob join, start the game via the PATCH endpoint, then fetch the room snapshot as Alice (host). The snapshot should identify Alice as the drawer and include the secret word for her view only.

**Acceptance Scenarios**:

1. **Given** a room with at least 2 participants in "lobby" status, **When** the host starts the game, **Then** the room status transitions to "playing", the host is assigned as the drawer, and the first word from the starter list is selected as the secret word.
2. **Given** a game in "playing" status, **When** the drawer fetches the room snapshot, **Then** the snapshot includes the drawer's participant ID, the drawer role, and the secret word.
3. **Given** a game in "playing" status, **When** a non-drawer participant fetches the room snapshot, **Then** the snapshot includes the drawer's participant ID and the participant's role as "guesser", but the secret word is not included.

---

### User Story 2 - Drawer Word Visibility on Game Page (Priority: P1)

After the game starts, both drawer and guessers land on the GamePage. The drawer sees the secret word displayed prominently. Guessers see that the drawer is drawing but do not see the word. The current drawer is identified in the participant list.

**Why this priority**: The drawer needs the word to draw; guessers must not see it for the game to be fair.

**Independent Test**: Open two browser tabs — create and start the game in tab A (host/drawer), join in tab B (guesser). Tab A shows the secret word. Tab B does not show the word. Both tabs identify who the drawer is.

**Acceptance Scenarios**:

1. **Given** the drawer is on the GamePage, **When** the page loads, **Then** the drawer sees a "Your secret word" card with the word displayed prominently.
2. **Given** a guesser is on the GamePage, **When** the page loads, **Then** the guesser does not see the secret word — they see a "Waiting for the drawer to draw" message instead.
3. **Given** any participant on the GamePage, **When** the page loads, **Then** the current drawer is identified in the participant list or player info card (e.g., "Drawer: Alice").

---

### User Story 3 - Player Name Trimming (Priority: P2)

Player names submitted when creating or joining a room are trimmed of leading/trailing whitespace. If the name is empty or whitespace-only after trimming, the request is rejected with a clear error message.

**Why this priority**: Clean player names improve UX; rejecting blank names prevents anonymous/confusing entries.

**Independent Test**: Submit a room creation request with a name like "  Alice  " — the stored name should be "Alice". Submit with an empty or whitespace-only name — the request should be rejected with an error message.

**Acceptance Scenarios**:

1. **Given** a player creates a room with the name "  Alice  ", **When** the room is created, **Then** the player's name is stored as "Alice" (trimmed).
2. **Given** a player attempts to join with an empty name, **When** they submit, **Then** the request is rejected with a "Player name cannot be empty" error.
3. **Given** a player attempts to create a room with a whitespace-only name "   ", **When** they submit, **Then** the request is rejected with a "Player name cannot be empty" error.

---

### Edge Cases

- What happens when a player joins after the game has started? The join should be rejected since the scenario doesn't describe mid-game joining.
- What happens when all words have been used? (Out of scope — only one round is supported.)
- What happens when the drawer leaves mid-game? Out of scope — no drawer rotation or mid-game handling is required.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: When the game starts, the system MUST assign the host as the drawer for the first round.
- **FR-002**: The system MUST deterministically select a word from the starter list as the secret word when the game starts.
- **FR-003**: The room snapshot MUST include a `drawerParticipantId` field identifying the current drawer.
- **FR-004**: The room snapshot MUST include the secret word ONLY when the requesting participant is the drawer.
- **FR-005**: The room snapshot MUST include the requesting participant's role (`"drawer"` or `"guesser"`).
- **FR-006**: The GamePage MUST display the secret word to the drawer.
- **FR-007**: The GamePage MUST NOT display the secret word to guessers.
- **FR-008**: The GamePage MUST identify the current drawer to all participants.
- **FR-009**: Player names MUST be trimmed of leading and trailing whitespace on create and join.
- **FR-010**: Empty or whitespace-only player names MUST be rejected with a "Player name cannot be empty" error.

### Key Entities

- **Drawer**: The participant assigned to draw in the current round — identified by `drawerParticipantId` on the Room.
- **Secret Word**: A word deterministically selected from the starter list, visible only to the drawer.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A game with 2 players can start and the drawer sees the secret word within 2 seconds of clicking "Start Game".
- **SC-002**: A guesser viewing the same game does not see the secret word (verified via API and UI).
- **SC-003**: Player names with surrounding whitespace are stored trimmed in all cases.
- **SC-004**: All existing unit tests pass; new tests cover drawer assignment, word visibility, and name trimming.

## Assumptions

- Only one round is supported. The drawer is fixed at game start and does not rotate.
- The secret word is deterministically selected as the first word from the `STARTER_WORDS` list.
- No mid-game joining — participants are fixed at game start.
- The `availableWords` field is still returned to all participants (the starter word list), but only the drawer sees which word is the secret word.

## Explicitly Out of Scope

The following items are intentionally excluded. Do not build them.

**Technical**: WebSockets / real-time sync; Databases / persistent storage; Authentication / accounts / sessions; Deployment / hosting / CI pipelines; Docker / containerization; New state-management or routing libraries.

**Game features**: Multiple rounds; Drawer rotation; Round timers / countdowns; Speed or drawer bonuses; Custom or random word packs; Spectator mode; Room moderation (kick / mute); Room passwords or invite links.

**Process**: Rewriting the starter from scratch; Adding top-level dependencies not justified by this spec; Refactoring unrelated code.
