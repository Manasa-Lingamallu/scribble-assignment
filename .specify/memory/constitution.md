# Scribble Constitution

## Core Principles

### I. Developer Prerequisites
All contributors must meet the following minimum requirements:
- Node.js 18+ and npm 9+ installed
- A modern browser (Chrome, Firefox, Safari, or Edge) — two tabs side by side for testing multi-player flows
- A code editor (VS Code recommended)
- Reading comfort with JavaScript or TypeScript (the starter uses both)
- Basic familiarity with React — components, props, state, hooks
- Basic familiarity with REST APIs — HTTP verbs, JSON request/response shapes, status codes
- Comfort with the command line for npm, git, and process management (starting/stopping dev servers)
- Comfort reading an existing codebase without immediately rewriting it — this is a brownfield enhancement, not a greenfield build

### II. Architecture & Stack
- **Backend**: Node.js, Express, TypeScript, Zod, `tsx` for execution
- **Frontend**: React (v18), React Router (v6), Vite, TypeScript
- **Runtime**: ES Modules throughout

### III. Strict Constraints (Non-Negotiable)
- **No WebSockets**: All sync must use HTTP polling
- **No Databases**: All data stored in-memory only
- **No Authentication**: No sessions, JWT, or OAuth

### IV. Code Quality Standards
- **TypeScript First**: Fully typed code; avoid `any`, prefer `unknown`
- **Validation**: Use Zod for all request payload and response validations
- **Immutability**: Prefer immutable data structures and pure functions
- **Error Handling**: Fail fast and gracefully; centralized error handlers on backend; UI must not crash on API exceptions

### V. Development Patterns
- **Frontend**: Functional components, strict hooks, react-router-dom v6, Zustand/Context for state in `src/state`, CSS modules or `app.css`
- **Backend**: Routes in `src/api`, business logic in `src/services`, data types in `src/models`
- **Imports**: Standard relative and absolute ES module imports

## Development Workflow

- **Backend Dev**: `cd backend && npm run dev`
- **Frontend Dev**: `cd frontend && npm run dev`
- Start both servers in separate terminals for local development
- Test multi-player flows by opening two browser tabs side by side
- Understand existing code before rewriting — brownfield enhancement

## Governance

This constitution defines the foundational rules of the project. All PRs and code reviews must verify compliance with the core principles and strict constraints. Amendments require documentation, team approval, and a migration plan when applicable. Use [AGENTS.md](../../AGENTS.md) for runtime development guidance.

**Version**: 1.0.0 | **Ratified**: 2026-06-05 | **Last Amended**: 2026-06-05
