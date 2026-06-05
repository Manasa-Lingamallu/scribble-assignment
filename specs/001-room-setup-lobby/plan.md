# Implementation Plan: Room Setup & Lobby

**Branch**: `001-room-setup-lobby` | **Date**: 2026-06-05 | **Spec**: `specs/001-room-setup-lobby/spec.md`

**Input**: Feature specification from `/specs/001-room-setup-lobby/spec.md`

## Summary

Add host tracking to rooms (creator = host), strengthen validation on empty/invalid codes and player names, implement lobby auto-polling at ~2s intervals, and enforce host-only start with a 2-player minimum. All changes extend existing code — no rewrites, no new dependencies.

## Technical Context

**Language/Version**: TypeScript (ES2022), Node.js 18+, React 18

**Primary Dependencies**: Express, Zod (backend); React, react-router-dom (frontend) — all existing

**Storage**: In-memory (Map<string, Room>) — no database

**Testing**: Vitest (existing in both frontend and backend)

**Target Platform**: Web browser (Chrome, Firefox, Safari, Edge)

**Project Type**: Web application (Express backend + React frontend, monorepo)

**Performance Goals**: Lobby polling completes in <500ms; UI remains responsive under 10 concurrent rooms

**Constraints**: No WebSockets, no databases, no authentication, no new dependencies

**Scale/Scope**: Local development with 2-4 simultaneous players; single-server in-memory

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Developer Prerequisites**: Met (Node 18+, npm 9+, modern browser, TS/React familiarity)
- **Architecture & Stack**: Backend Express + Zod, Frontend React + Vite — unchanged
- **Strict Constraints**: No WebSockets (polling only), no databases, no authentication — all satisfied
- **Code Quality**: TypeScript First, Zod validation, immutability, error handling — all followed
- **Development Patterns**: Functional components, hooks, existing state pattern — all followed
- **No new dependencies**: Required — no additional npm packages needed

## Project Structure

### Documentation (this feature)

```text
specs/001-room-setup-lobby/
├── plan.md              # This file
├── spec.md              # Feature specification
└── tasks.md             # Implementation tasks
```

### Source Code (repository root)

```text
backend/src/
├── models/
│   └── game.ts                    # Add hostParticipantId to Room type
├── services/
│   └── roomStore.ts               # Host tracking in createRoom, isHost check
├── api/
│   ├── rooms.ts                   # Add start-game endpoint (PATCH)
│   ├── schemas.ts                 # Validation schemas for name/code
│   └── schemas.test.ts            # Tests for new validation rules
└── services/
    └── roomStore.test.ts          # Tests for host tracking

frontend/src/
├── pages/
│   ├── CreateRoomPage.tsx         # Add inline name validation
│   ├── JoinRoomPage.tsx           # Add inline name + code validation
│   └── LobbyPage.tsx              # Auto-polling, host-only start button
├── state/
│   └── roomStore.ts               # Polling interval management, startGame action
├── services/
│   └── api.ts                     # Add startGame API call
└── services/
    └── api.test.ts                # Tests for new API method
```

**Structure Decision**: Web application with existing `backend/src/` and `frontend/src/` structure. All changes are additive within existing files or extend existing patterns.

## Complexity Tracking

No constitution violations — all changes stay within the existing stack, constraints, and patterns. No new dependencies or architectural deviations.
