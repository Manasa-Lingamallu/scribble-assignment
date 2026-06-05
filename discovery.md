# Discovery Notes

## Incomplete Behaviors

1. **Canvas endpoint lacks participant authentication** — `PUT /:code/canvas` in `backend/src/api/rooms.ts:137` accepts a `dataUrl` from any caller without requiring a `participantId`. Any client who knows a room code can overwrite the canvas.

2. **Secret word never rotates** — `backend/src/api/rooms.ts:70` always picks `STARTER_WORDS[0]` ("rocket") on start. The `availableWords` list on the snapshot is never used for word selection or rotation, and `restartGame` does not cycle to the next word.

3. **ResultPanel component is a static placeholder** — `frontend/src/components/ResultPanel.tsx` renders a hardcoded description ("Game activity and guesses will appear here.") and is never wired to actual game data or guess history.

4. **No drawer scoring** — `backend/src/services/roomStore.ts:123` awards +100 points only to the correct guesser. The drawer receives no points regardless of the outcome.

5. **Canvas drawing lacks touch support** — `frontend/src/pages/GamePage.tsx:222-264` only handles `mousedown`/`mousemove`/`mouseup`/`mouseleave` events. No `touchstart`/`touchmove`/`touchend` handlers, making it unusable on mobile/tablet.

6. **Duplicate player names allowed** — `backend/src/services/roomStore.ts:74` appends a new participant without checking whether the display name already exists in the room.

## Assumptions

1. **The host is always the drawer** — `backend/src/api/rooms.ts:69` sets `drawerParticipantId` to `hostParticipantId` unconditionally. There is no drawer rotation mechanism between rounds.

2. **Single-round game model** — `frontend/src/pages/GamePage.tsx:75` hardcodes "Round 1". The backend has no round counter, and `restartGame` resets everything to lobby rather than advancing to a next round.

3. **No room lifecycle management** — Rooms live in memory indefinitely (`roomStore.ts` `Map<string, Room>`). There is no timeout, cleanup, or expiry logic for abandoned rooms.

## Relevant Files

| File | Purpose |
|------|---------|
| `backend/src/models/game.ts` | Room, Participant, Guess, RoomSnapshot types |
| `backend/src/api/rooms.ts` | All REST endpoints (create, join, start, guess, canvas, end, restart, get) |
| `backend/src/api/schemas.ts` | Zod validation schemas and HttpError class |
| `backend/src/services/roomStore.ts` | In-memory room store and game logic |
| `backend/src/seed/starterData.ts` | Word list and roles seed data |
| `backend/src/app.ts` | Express app setup |
| `frontend/src/services/api.ts` | HTTP client for all backend endpoints |
| `frontend/src/state/roomStore.ts` | React state store with polling |
| `frontend/src/pages/GamePage.tsx` | Game page with canvas drawing and guess UI |
| `frontend/src/pages/LobbyPage.tsx` | Lobby with polling and host controls |
| `frontend/src/pages/CreateRoomPage.tsx` | Room creation form |
| `frontend/src/pages/JoinRoomPage.tsx` | Room join form |
| `frontend/src/components/ResultScreen.tsx` | Round-end result display |
| `frontend/src/components/GuessForm.tsx` | Guess input form |
| `frontend/src/components/Scoreboard.tsx` | Scoreboard display |
| `frontend/src/components/ResultPanel.tsx` | Static placeholder (unimplemented) |
