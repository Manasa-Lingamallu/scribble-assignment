# Implementation Plan: Gameplay Interaction

**Branch**: `003-gameplay-interaction` | **Date**: 2026-06-05 | **Spec**: `specs/003-gameplay-interaction/spec.md`

**Input**: Feature specification from `/specs/003-gameplay-interaction/spec.md`

## Summary

When a round is active, the drawer can draw on and clear a canvas, and guessers submit text guesses. Guesses are trimmed, case-insensitively compared to the secret word, and empty guesses are rejected. All players see the guess history via polling. A correct guess awards 100 points to the guesser.

## Technical Context

**Language/Version**: TypeScript (ES2022), Node.js 18+, React 18

**Primary Dependencies**: Express, Zod (backend); React, react-router-dom (frontend) — all existing

**Storage**: In-memory (Map<string, Room>) — no database

**Testing**: Vitest (existing in both frontend and backend)

**Target Platform**: Web browser (Chrome, Firefox, Safari, Edge)

**Project Type**: Web application (Express backend + React frontend, monorepo)

**Performance Goals**: Guess submission and polling complete in <300ms; canvas interaction remains responsive at 60fps

**Constraints**: No WebSockets, no databases, no authentication, no new dependencies

**Scale/Scope**: Single-round games with 2-4 players; in-memory guess history; deterministic word from 5-word starter list

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
specs/003-gameplay-interaction/
├── plan.md              # This file
├── spec.md              # Feature specification
└── tasks.md             # Implementation tasks
```

### Source Code (repository root)

```text
backend/src/
├── models/
│   └── game.ts                        # Add Guess type, score to Participant, guesses[] to Room
├── services/
│   └── roomStore.ts                   # Guess submission and validation, score tracking
├── api/
│   ├── rooms.ts                       # Add guess submission endpoint (POST /rooms/:code/guess)
│   ├── schemas.ts                     # Guess validation schema
│   └── schemas.test.ts                # Tests for guess validation
└── services/
    └── roomStore.test.ts              # Tests for guess submission, scoring, empty rejection

frontend/src/
├── pages/
│   └── GamePage.tsx                   # Canvas area, guess input, guess history, score display
├── components/
│   └── (inline in GamePage or new)    # Canvas placeholder, GuessForm update, GuessHistory display
├── services/
│   └── api.ts                         # Add submitGuess API call, update RoomSnapshot with guesses/scores
├── state/
│   └── roomStore.ts                   # Add submitGuess action
└── services/
    └── api.test.ts                    # Tests for new API method
```

**Structure Decision**: Web application with existing `backend/src/` and `frontend/src/` structure. All changes are additive within existing files or extend existing patterns.

## Complexity Tracking

No constitution violations — all changes stay within the existing stack, constraints, and patterns. No new dependencies or architectural deviations.
