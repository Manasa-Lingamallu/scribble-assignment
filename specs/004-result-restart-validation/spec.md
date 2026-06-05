# Feature Specification: Result, Restart & Final Validation

**Feature Branch**: `004-result-restart-validation`

**Created**: 2026-06-05

**Status**: Draft

**Input**: User description: "Given a round has ended, When the result state is displayed and the host restarts, Then all players see the correct word, final scores, and full guess history; on restart, everyone returns to the lobby with players preserved and all round state cleared."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Round End & Result Display (Priority: P1)

When a correct guess is submitted, the room status transitions to "finished". All players see a result screen revealing the secret word, final scores, and the complete guess history. The host can also manually end the round early at any time via an "End Round" button.

**Why this priority**: Without round-ending logic and result display, the game has no conclusion — players cannot see the outcome of their guesses.

**Independent Test**: Start a game, submit a correct guess. The room status changes to "finished" and all players see the result screen with the secret word revealed, final scores, and all guesses listed.

**Acceptance Scenarios**:

1. **Given** a game in "playing" status, **When** a guesser submits a correct guess, **Then** the room status transitions to "finished" automatically.
2. **Given** a game in "playing" status, **When** the host (drawer) clicks "End Round", **Then** the room status transitions to "finished".
3. **Given** a round has ended, **When** any participant views the result screen, **Then** the secret word is revealed to all (not just the drawer).
4. **Given** a round has ended, **When** any participant views the result screen, **Then** the final scores for all participants are displayed.
5. **Given** a round has ended, **When** any participant views the result screen, **Then** the full guess history is displayed (each guess with participant name, text, and correct/incorrect indicator).
6. **Given** a game in "playing" status, **When** a non-host (guesser) attempts to end the round, **Then** the request is rejected (only the host can end the round manually).

---

### User Story 2 - Host Restart (Priority: P1)

On the result screen, the host sees a "Restart Game" button. Clicking it returns the room to "lobby" status, preserving all participants but clearing round-specific state (drawer assignment, secret word, guesses, canvas, scores). Non-host participants see "Waiting for host to restart..." and are redirected to the lobby via polling.

**Why this priority**: Restarting enables the core play loop — without it, each game is a one-shot experience.

**Independent Test**: End a round, then click "Restart Game" as the host. The room status returns to "lobby". All participants are still in the room. Scores are reset to 0. The drawer, secret word, guesses, and canvas are cleared.

**Acceptance Scenarios**:

1. **Given** a round has ended, **When** the host clicks "Restart Game", **Then** the room status transitions to "lobby".
2. **Given** a round has ended and the host restarts, **When** the lobby loads, **Then** all participants from the previous round are still in the room.
3. **Given** a round has ended and the host restarts, **When** the lobby loads, **Then** all participant scores are reset to 0.
4. **Given** a round has ended and the host restarts, **When** the lobby loads, **Then** the drawer assignment, secret word, guess history, and canvas are cleared.
5. **Given** a round has ended, **When** a non-host views the result screen, **Then** they see "Waiting for host to restart..." and no restart button.
6. **Given** the host restarts, **When** non-host participants poll the room, **Then** they detect the "lobby" status and are redirected to the lobby page.

---

### User Story 3 - Polling-Based Result & Lobby Navigation (Priority: P2)

All participants detect the "finished" status via the existing polling mechanism and are automatically shown the result screen. After restart, they detect the "lobby" status and are redirected back to the lobby page. This ensures all players stay in sync without manual refresh.

**Why this priority**: Automatic navigation via polling provides a seamless experience — players don't need to manually refresh or click buttons to see the result or return to lobby.

**Independent Test**: Open two tabs (drawer and guesser). The guesser submits a correct guess. In the next poll cycle (~2s), both tabs show the result screen. When the host restarts, both tabs are redirected to the lobby.

**Acceptance Scenarios**:

1. **Given** a game in "playing" status, **When** a correct guess is submitted, **Then** all participants see the result screen within the next polling cycle (~2s).
2. **Given** a round has ended, **When** the host restarts, **Then** all participants see the lobby page within the next polling cycle (~2s).
3. **Given** a participant on the result screen, **When** they navigate away, **Then** polling continues to detect restart.

---

### Edge Cases

- What happens when the drawer submits a correct guess? The drawer cannot submit guesses (no guess form), so this is impossible.
- What happens when a guesser ends the round manually? The request is rejected — only the host can manually end the round.
- What happens when the host restarts but a new player is mid-join? The join will succeed since the room is in lobby status.
- What happens when the host restarts and immediately starts a new game? All round state is properly cleared, so the new game starts fresh.
- What happens when all guessers have already guessed incorrectly and the drawer wants to end? The drawer can use the "End Round" button to manually end.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST support a "finished" room status in addition to "lobby" and "playing".
- **FR-002**: A correct guess MUST automatically transition the room status to "finished".
- **FR-003**: The host MUST be able to manually end the round via an "End Round" action, transitioning the room to "finished".
- **FR-004**: Only the host MUST be able to manually end the round — non-host requests MUST be rejected.
- **FR-005**: The result screen MUST reveal the secret word to all participants.
- **FR-006**: The result screen MUST display the final scores of all participants.
- **FR-07**: The result screen MUST display the full guess history.
- **FR-008**: The host MUST see a "Restart Game" button on the result screen.
- **FR-009**: Non-host participants MUST NOT see the restart button — they see "Waiting for host to restart...".
- **FR-010**: Restart MUST return the room status to "lobby".
- **FR-011**: Restart MUST preserve all participants in the room.
- **FR-012**: Restart MUST reset all participant scores to 0.
- **FR-013**: Restart MUST clear the drawer assignment (`drawerParticipantId`).
- **FR-014**: Restart MUST clear the secret word (`secretWord`), guess history (`guesses`), and canvas data (`canvasDataUrl`).
- **FR-015**: Participants MUST detect the "finished" and "lobby" status changes via the existing polling mechanism.
- **FR-016**: Participants MUST be automatically redirected to the result screen or lobby based on room status polling.

### Key Entities

- **Round**: A single play session within a room — has a drawer, secret word, guess history, and canvas state. Cleared on restart.
- **Room Status**: Extended to support three states: `"lobby"` (waiting for players), `"playing"` (round active), `"finished"` (round over, showing results).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A correct guess transitions the room to "finished" status within 1 second.
- **SC-002**: The host can manually end the round and all players see the result screen within 2 seconds (one poll cycle).
- **SC-003**: Restart clears all round state and returns to lobby within 1 second.
- **SC-004**: All players are redirected to the correct page (result or lobby) based on status within 2 seconds of the change.
- **SC-005**: All existing unit tests pass; new tests cover end-round logic, restart logic, and status transitions.

## Assumptions

- The round ends automatically only when a correct guess is submitted — there is no timer or guess limit.
- The host can also manually end the round at any time via an "End Round" button (useful if the drawer wants to give up, or the round has stalled).
- Restart preserves the participant list exactly as-is (including participant IDs and names).
- The host remains the same after restart (no host rotation).
- After restart, a new game can be started by the host via the existing start-game flow.
- The "finished" status is required so the frontend can distinguish between "round active" (playing) and "round over" (finished).

## Explicitly Out of Scope

The following items are intentionally excluded. Do not build them.

**Technical**: WebSockets / real-time sync; Databases / persistent storage; Authentication / accounts / sessions; Deployment / hosting / CI pipelines; Docker / containerization; New state-management or routing libraries.

**Game features**: Multiple rounds; Drawer rotation; Round timers / countdowns; Speed or drawer bonuses; Custom or random word packs; Spectator mode; Room moderation (kick / mute); Room passwords or invite links.

**Process**: Rewriting the starter from scratch; Adding top-level dependencies not justified by this spec; Refactoring unrelated code.
