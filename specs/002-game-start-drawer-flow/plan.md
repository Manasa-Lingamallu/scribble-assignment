# Implementation Plan: Game Start & Drawer Flow

**Branch**: `002-game-start-drawer-flow` | **Date**: 2026-06-05 | **Spec**: `specs/002-game-start-drawer-flow/spec.md`

**Input**: Feature specification from `/specs/002-game-start-drawer-flow/spec.md`

## Summary

When the host starts a game with 2+ players, the room transitions to "playing", the host is assigned as drawer, and a secret word is deterministically selected from the starter list. The drawer sees the word on the GamePage; guessers do not. Player names are trimmed on create/join, and empty/whitespace-only names are rejected.

## Technical Context

**Language/Version**: TypeScript (ES2022), Node.js 18+, React 18

**Primary Dependencies**: Express, Zod (backend); React, react-router-dom (frontend) — all existing

**Storage**: In-memory (Map<string, Room>) — no database

**Testing**: Vitest (existing in both frontend and backend)

**Target Platform**: Web browser (Chrome, Firefox, Safari, Edge)

**Project Type**: Web application (Express backend + React frontend, monorepo)

**Performance Goals**: Word selection and role assignment complete within the start-game request (<200ms)

**Constraints**: No WebSockets, no databases, no authentication, no new dependencies

**Scale/Scope**: Single-round games with 2-4 players; deterministic word selection from 5-word starter list

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
specs/002-game-start-drawer-flow/
├── plan.md              # This file
├── spec.md              # Feature specification
└── tasks.md             # Implementation tasks
```

### Source Code (repository root)

```text
backend/src/
├── models/
│   └── game.ts                        # Add drawerParticipantId, secretWord to Room; add to RoomSnapshot
├── services/
│   └── roomStore.ts                   # Drawer assignment in start flow, word selection, conditional word in snapshot
├── api/
│   └── rooms.ts                       # Update start endpoint to assign drawer + select word
└── services/
    └── roomStore.test.ts              # Tests for drawer assignment and word visibility

frontend/src/
├── pages/
│   └── GamePage.tsx                   # Show secret word to drawer, identify drawer, show role
├── components/
│   └── (maybe new) WordReveal.tsx     # Secret word display component (or inline in GamePage)
├── services/
│   └── api.ts                         # Update RoomSnapshot type with drawerParticipantId, role, secretWord
├── state/
│   └── roomStore.ts                   # No changes needed — uses RoomSnapshot
└── services/
    └── api.test.ts                    # Update test snapshots with new fields
```

**Structure Decision**: Web application with existing `backend/src/` and `frontend/src/` structure. All changes are additive within existing files or extend existing patterns.

## Complexity Tracking

No constitution violations — all changes stay within the existing stack, constraints, and patterns. No new dependencies or architectural deviations.
