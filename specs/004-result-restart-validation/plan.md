# Implementation Plan: Result, Restart & Final Validation

**Branch**: `004-result-restart-validation` | **Date**: 2026-06-05 | **Spec**: `specs/004-result-restart-validation/spec.md`

**Input**: Feature specification from `/specs/004-result-restart-validation/spec.md`

## Summary

When a correct guess is made (or the host manually ends the round), the room transitions to "finished" status. All players see a result screen showing the secret word, final scores, and full guess history. The host can restart the game, returning everyone to the lobby with participants preserved and all round state cleared.

## Technical Context

**Language/Version**: TypeScript (ES2022), Node.js 18+, React 18

**Primary Dependencies**: Express, Zod (backend); React, react-router-dom (frontend) — all existing

**Storage**: In-memory (Map<string, Room>) — no database

**Testing**: Vitest (existing in both frontend and backend)

**Target Platform**: Web browser (Chrome, Firefox, Safari, Edge)

**Project Type**: Web application (Express backend + React frontend, monorepo)

**Performance Goals**: Round end and restart complete in <300ms; result screen renders within one polling cycle (2s)

**Constraints**: No WebSockets, no databases, no authentication, no new dependencies

**Scale/Scope**: Single-round games with 2-4 players; round may end via correct guess or host action; restart preserves participant list

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Developer Prerequisites**: Met
- **Architecture & Stack**: Backend Express + Zod, Frontend React + Vite — unchanged
- **Strict Constraints**: No WebSockets (polling only), no databases, no authentication — all satisfied
- **Code Quality**: TypeScript First, Zod validation, immutability, error handling — all followed
- **Development Patterns**: Functional components, hooks, existing state pattern — all followed
- **No new dependencies**: Required — no additional npm packages needed

## Project Structure

### Documentation (this feature)

```text
specs/004-result-restart-validation/
├── plan.md              # This file
├── spec.md              # Feature specification
└── tasks.md             # Implementation tasks
```

### Source Code (repository root)

```text
backend/src/
├── models/
│   └── game.ts                        # Add "finished" to RoomStatus
├── services/
│   └── roomStore.ts                   # End round logic, restart logic (clear round state)
├── api/
│   ├── rooms.ts                       # Add PATCH /:code/end-round and PATCH /:code/restart
│   └── schemas.ts                     # (No new schemas needed — reuse participantId)
└── services/
    └── roomStore.test.ts              # Tests for end-round and restart

frontend/src/
├── pages/
│   └── GamePage.tsx                   # Detect "finished" status, show result screen
├── components/
│   └── (new or inline) ResultScreen   # Secret word reveal, final scores, guess history, restart button
├── services/
│   └── api.ts                         # Add endRound, restartGame API calls
├── state/
│   └── roomStore.ts                   # Add endRound, restartGame actions; navigate on status change
└── services/
    └── api.test.ts                    # Tests for new API methods
```

**Structure Decision**: Web application with existing `backend/src/` and `frontend/src/` structure. All changes are additive within existing files or extend existing patterns.

## Complexity Tracking

No constitution violations — all changes stay within the existing stack, constraints, and patterns. No new dependencies or architectural deviations.
