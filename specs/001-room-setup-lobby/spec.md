# Feature Specification: Room Setup & Lobby

**Feature Branch**: `001-room-setup-lobby`

**Created**: 2026-06-05

**Status**: Draft

**Input**: User description: "Given a player wants to host or join a drawing game, When they create or join a room via a unique code, Then the creator is automatically the host; invalid/empty codes are rejected with clear feedback; rooms are fully isolated; the lobby refreshes via polling (~2s); and only the host can start the game once at least 2 players are present."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Room Creation & Joining (Priority: P1)

A player arrives at the landing page and either creates a new room (becoming the first participant and host) or joins an existing room by entering a 4-character code. Invalid or empty room codes are rejected with clear inline feedback. Players must provide a non-empty name.

**Why this priority**: Core gameplay loop — without the ability to create and join rooms, no multiplayer interaction is possible.

**Independent Test**: Can be fully tested by running both servers, opening two browser tabs, creating a room in one, and joining with the correct code in the other. Both participants appear in the room lobby.

**Acceptance Scenarios**:

1. **Given** a player on the landing page, **When** they click "Create Room" and enter a valid name, **Then** a new room is created with a unique 4-character code, the player is listed as a participant in the lobby, and the room code is displayed in a badge.
2. **Given** a room exists with a known code, **When** a second player enters that code and a valid name on the Join Room page, **Then** they are added to the room and both participants are visible in the lobby.
3. **Given** a player on the Join Room page, **When** they enter an empty or blank room code, **Then** a clear inline error message is shown and the request is not sent.
4. **Given** a player on the Join Room page, **When** they enter a non-existent room code, **Then** a clear error message ("Room not found") is displayed.
5. **Given** a player on the Create or Join Room form, **When** they submit a blank or whitespace-only player name, **Then** a clear inline error is shown and the request is not sent.

---

### User Story 2 - Host & Start Game (Priority: P1)

The player who created the room is designated as the host. Only the host sees and can click the "Start Game" button. The button is enabled only when at least 2 players are in the lobby. Non-host participants see a "Waiting for host to start..." message.

**Why this priority**: Game cannot proceed without a host decision; the 2-player minimum ensures a meaningful game.

**Independent Test**: Can be verified by creating a room in tab A, joining from tab B, and confirming only tab A shows an enabled "Start Game" button. With only one player present, the button is disabled.

**Acceptance Scenarios**:

1. **Given** a room is created with one participant, **When** the lobby loads, **Then** the creator is identified as the host (stored internally) and sees a disabled "Start Game" button with a "Need at least 2 players" hint.
2. **Given** a room with at least 2 participants, **When** a non-host participant views the lobby, **Then** they do not see the "Start Game" button — they see "Waiting for host to start..." instead.
3. **Given** a room with exactly 2 participants, **When** the host views the lobby, **Then** the "Start Game" button is enabled.
4. **Given** a room where the host clicks "Start Game" with 2+ participants, **Then** the room status transitions to "playing" (blocked in this lab since game rounds are out of scope, but the button click triggers the status change).
5. **Given** a room with 1 participant, **When** the host views the lobby, **Then** the "Start Game" button is visible but disabled.

---

### User Story 3 - Lobby Auto-Polling (Priority: P2)

The lobby page automatically fetches the latest room state every ~2 seconds so participants see new joiners, host status changes, and start-game readiness without manual refreshing.

**Why this priority**: Manual refreshing creates a poor UX; auto-polling is essential for a smooth lobby experience.

**Independent Test**: Can be verified by opening the lobby in tab A and joining from tab B — tab A should show the new participant appear within ~2 seconds without clicking the refresh button.

**Acceptance Scenarios**:

1. **Given** a participant in the lobby, **When** another player joins the room, **Then** the lobby updates automatically within ~2 seconds to show the new participant.
2. **Given** a participant in the lobby, **When** they are on the lobby page, **Then** polling requests are sent at approximately 2-second intervals.
3. **Given** a participant navigates away from the lobby page, **When** they leave the lobby, **Then** polling stops (no unnecessary network requests).
4. **Given** a polling request fails (network error), **When** the error occurs, **Then** the lobby displays a non-blocking "Connection issue — retrying..." message and continues polling.

---

### Edge Cases

- What happens when a player creates a room and immediately the browser is closed? The room remains in memory but is effectively orphaned. No cleanup is needed per the in-memory constraint.
- What happens when a player tries to join a room that is full? (Not applicable — no player limit is specified.)
- What happens when the host leaves? Host is fixed at creation time and does not transfer.
- What happens when a participant tries to join a room that is already playing? The join should return an error since the scenario doesn't specify re-joining mid-game.
- What happens when multiple players try to join simultaneously? Room isolation per code and atomic Map operations handle this safely.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST generate a unique 4-character room code for each new room.
- **FR-002**: System MUST reject attempts to join with an empty or whitespace-only room code with a clear validation error.
- **FR-003**: System MUST reject attempts to create or join with an empty or whitespace-only player name with a clear validation error.
- **FR-004**: System MUST reject attempts to join a non-existent room code with a "Room not found" error.
- **FR-005**: System MUST designate the room creator as the host and persist that designation.
- **FR-006**: System MUST expose whether the current viewer is the host in the room snapshot.
- **FR-007**: Only the host MUST be able to start the game (send a status change request).
- **FR-008**: The host MUST only be able to start the game when at least 2 participants are in the room.
- **FR-009**: The lobby MUST auto-poll the room state at approximately 2-second intervals.
- **FR-010**: Polling MUST stop when the participant navigates away from the lobby page.
- **FR-011**: Network errors during polling MUST NOT crash the UI — a non-blocking message should be shown.
- **FR-012**: Rooms MUST be fully isolated by their unique code (no cross-room participant leaks).

### Key Entities

- **Participant**: A player in a room, identified by a UUID, with a display name and join timestamp.
- **Room**: A game session identified by a unique 4-character code, containing a list of participants, a host participant ID, and a status (`"lobby"`).
- **Host**: The participant who created the room — stored as `hostParticipantId` on the Room entity.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A player can create a room and another can join it by code in under 3 steps each.
- **SC-002**: Invalid/empty room codes and player names produce visible error feedback within 1 second of submission.
- **SC-003**: Host-only start button behavior is correctly enforced for all participants within 1 polling cycle (2s).
- **SC-004**: Lobby participant list updates within 3 seconds of a new player joining.
- **SC-005**: All existing unit tests pass; new unit tests cover host tracking, validation, and polling.

## Assumptions

- Room codes are 4 alphanumeric characters (uppercase, excluding vowels and ambiguous chars as currently implemented).
- No player limit per room (any number can join).
- Host is fixed at creation and does not transfer.
- The "Start Game" button triggers a PATCH or POST to transition room status — actual game round logic is out of scope.

## Explicitly Out of Scope

The following items are intentionally excluded. Do not build them.

**Technical**: WebSockets / real-time sync; Databases / persistent storage; Authentication / accounts / sessions; Deployment / hosting / CI pipelines; Docker / containerization; New state-management or routing libraries.

**Game features**: Multiple rounds; Drawer rotation; Round timers / countdowns; Speed or drawer bonuses; Custom or random word packs; Spectator mode; Room moderation (kick / mute); Room passwords or invite links.

**Process**: Rewriting the starter from scratch; Adding top-level dependencies not justified by this spec; Refactoring unrelated code.
