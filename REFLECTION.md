# Reflection Report

## What the Starter App Already Had

### Backend (`backend/`)
- **Express server** fully set up with TypeScript and `tsx` execution
- **In-memory room store**: `roomStore.ts` with `createRoom`, `joinRoom`, `getRoom`, `saveRoom`, `toRoomSnapshot`
- **Zod validation** schemas for `createRoom`, `joinRoom`, room params, viewer query
- **Seed data**: `starterData.ts` with word lists and roles
- **API routes**: `POST /rooms`, `POST /rooms/:code/join`, `GET /rooms/:code`
- **Models**: `Participant`, `Room`, `RoomSnapshot`, `ParticipantRole` types (status only `"lobby"`)
- **Tests**: `schemas.test.ts`, `roomStore.test.ts` with Vitest

### Frontend (`frontend/`)
- **React 18 + Vite** with TypeScript and React Router v6
- **Component library**: `Card`, `GuessForm`, `PageHeader`, `ResultPanel`, `RoomCodeBadge`, `Scoreboard`, `AppShell`
- **Pages**: `StartPage`, `CreateRoomPage`, `JoinRoomPage`, `LobbyPage`, `GamePage`
- **API service layer**: `api.ts` with `createRoom`, `joinRoom`, `fetchRoom` methods
- **State management**: `RoomStore` class using `useSyncExternalStore` with `RoomStoreProvider`
- **Room data flow**: creating/joining rooms, displaying room code, participant list, manual refresh
- **CSS styling**: `app.css` with card layout, forms, buttons, panels
- **Tests**: `api.test.ts`

---

## What Was Added (4 Scenarios)

### Scenario 1 — Room Setup & Lobby
- **Backend**
  - `hostParticipantId` field on `Room` and `RoomSnapshot`
  - `isHost` flag on `RoomSnapshot`
  - `startGameSchema` for participant authorization
  - `PATCH /:code/start` endpoint with host-only and minimum-players guards
  - `startGame()` in `roomStore.ts`
  - Tests for host tracking and start-game validation
- **Frontend**
  - `LobbyPage`: auto-polling (2s), host-only "Start Game" button, redirect to `/game` on start
  - `CreateRoomPage` and `JoinRoomPage` wired to `roomStore`
  - `startGame()` in `roomStore.ts`

### Scenario 2 — Game Start & Drawer Flow
- **Backend**
  - `drawerParticipantId` and `secretWord` fields on `Room`/`RoomSnapshot`
  - `role` field on `RoomSnapshot` (`"drawer"` or `"guesser"`)
  - Drawer gets secret word in snapshot; guesser gets `undefined`
- **Frontend**
  - `GamePage`: role-based rendering — drawer sees secret word card, guesser sees drawer info
  - `LobbyPage`: redirects to `/game` when status changes to `"playing"`

### Scenario 3 — Gameplay Interaction
- **Backend**
  - `Guess` type (participantId, participantName, text, isCorrect, createdAt)
  - `score` on `Participant`, `guesses` on `Room`/`RoomSnapshot`, `canvasDataUrl`
  - `submitGuess()` — case-insensitive, whitespace-trimmed, correct → +100pts, drawer cannot guess
  - `updateCanvas()` — stores canvas data URL
  - `POST /:code/guess` and `PUT /:code/canvas` endpoints
  - Comprehensive tests for guess logic
- **Frontend**
  - Interactive canvas drawing component with mouse events
  - `GuessForm` wired to `submitGuess` API
  - `Scoreboard` displaying sorted participants with scores
  - Guess History display
  - Canvas data URL sync via HTTP PUT
  - Auto-polling on `GamePage`
  - `submitGuess()`, `updateCanvas()` in `api.ts` and `roomStore.ts`

### Scenario 4 — Result, Restart & Final Validation
- **Backend**
  - `"finished"` status in `RoomStatus` type
  - `endRound()` — host-only, sets status to `"finished"`
  - `restartGame()` — host-only, resets to `"lobby"` with cleared scores/guesses/drawer
  - `submitGuess()` auto-ends round on correct guess (sets `status = "finished"`)
  - `toRoomSnapshot` reveals `secretWord` to all participants when finished
  - `PATCH /:code/end-round` and `POST /:code/restart` endpoints
- **Frontend**
  - `ResultScreen` component — shows secret word, sorted final scores, guesses list, "New Game" button (host)
  - `GamePage`: renders `ResultScreen` on "finished" status, "End Round" button for host
  - `LobbyPage`: redirects to `/game` for any non-lobby status
  - `endRound()`, `restartGame()` in `api.ts` and `roomStore.ts`

---

## Test Results

| Area | Tests |
|------|-------|
| Backend roomStore | 29 tests |
| Backend schemas | 13 tests |
| Frontend api | 6 tests |
| **Total** | **48 all passing** |
