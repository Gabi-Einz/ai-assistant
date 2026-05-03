# AI Assistant

A fullstack AI assistant challenge. Two screens — `/auth` (register/login) and `/chat` (multi-conversation AI interface with real-time streaming and extensible tool calling).

![pnpm](https://img.shields.io/badge/pnpm-9-orange) ![Bun](https://img.shields.io/badge/Bun-1-black) ![React](https://img.shields.io/badge/React-19-61DAFB) ![tRPC](https://img.shields.io/badge/tRPC-11-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-7-green)

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Running with Docker](#running-with-docker)
- [Running Locally](#running-locally)
- [Architecture](#architecture)
- [Technical Decisions](#technical-decisions)
- [AI-Assisted Workflow](#ai-assisted-workflow)
- [What Would Be Improved](#what-would-be-improved)

---

## Prerequisites

| Tool | Version | Required for |
|------|---------|-------------|
| [Node.js](https://nodejs.org) | 20+ | pnpm / corepack |
| [pnpm](https://pnpm.io) | 9+ | package management (`corepack enable`) |
| [Bun](https://bun.sh) | 1+ | local API dev server and test runner |
| [Docker](https://docker.com) | 24+ | containerised stack |
| Anthropic API key | — | AI responses ([console.anthropic.com](https://console.anthropic.com)) |
| OpenWeatherMap API key | — | `get_weather` tool ([openweathermap.org](https://openweathermap.org/api)) |

---

## Environment Variables

Copy the example file and fill in the values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes (local) | MongoDB connection string — overridden by Docker Compose |
| `AI_API_KEY` | Yes | Anthropic (or compatible) API key |
| `WEATHER_API_KEY` | Yes | OpenWeatherMap API key |
| `BETTERAUTH_SECRET` | Yes | Long random string used to sign sessions — any value works locally |
| `PORT` | No | API port (default: `3000`) |
| `VITE_API_URL` | No | Backend URL consumed by the frontend (default: `http://localhost:3000`) |

---

## Running with Docker

The Docker stack starts MongoDB and the API in isolated containers. No local Bun or MongoDB installation is needed.

```bash
docker compose up
```

Verify the API is running:

```bash
curl http://localhost:3000/trpc/chat.list
# → {"error":{"message":"UNAUTHORIZED",...}} — HTTP 401, not a connection error
```

To stop and clean up:

```bash
docker compose down
```

> **Note:** MongoDB data is persisted in a named volume (`mongo_data`). Add `-v` to `docker compose down` to remove it.

---

## Running Locally

```bash
# Install all workspace dependencies
pnpm install

# Run mongoDb instance
docker run -d -p 27017:27017 --name mongodb mongo

# Start all apps in parallel (API on :3000, web on :3001)
pnpm dev
```

The `MONGODB_URI` in `.env` must point to a running MongoDB instance (e.g., `mongodb://localhost:27017/ai_assistant`).

To run tests:

```bash
pnpm test
```

---

## Architecture

### Monorepo Layout

```
/
├── apps/
│   ├── api/          # Backend — Bun + Hono, Hexagonal Architecture
│   └── web/          # Frontend — React 19, TanStack Start (SSR)
├── packages/
│   └── shared/       # Shared Zod schemas, tRPC router types, tool payload types
├── openspec/         # AI-assisted spec & change tracking (proposal → design → tasks)
├── pnpm-workspace.yaml
└── turbo.json
```

### Hexagonal Architecture (Backend)

The backend (`apps/api`) is structured around the Hexagonal Architecture pattern (Ports & Adapters). The **Dependency Rule** is absolute: source-code dependencies point inward only.

```
┌─────────────────────────────────────────────┐
│  Infrastructure (outermost)                 │
│  Hono, tRPC routers, MongoDB adapters,      │
│  AI SDK provider, BetterAuth, tools         │
│  ┌───────────────────────────────────────┐  │
│  │  Application                          │  │
│  │  Use cases, DTOs                      │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │  Domain (innermost)             │  │  │
│  │  │  Entities, Port interfaces,     │  │  │
│  │  │  Domain errors                  │  │  │
│  │  │  Zero external imports          │  │  │
│  │  └─────────────────────────────────┘  │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

**Why Hexagonal?** Use cases are tested in pure TypeScript against port interfaces — no database, no HTTP server, no AI SDK required in unit tests. Framework changes (e.g., replacing Hono with a different HTTP server) affect only the outermost shell.

**Ports catalogue:**

| Interface | Responsibility |
|-----------|---------------|
| `IChatRepository` | CRUD on chat aggregates |
| `IMessageRepository` | Persist and retrieve messages by chat |
| `IAIProvider` | Stream AI responses with tool support |
| `IDateTimeProvider` | Deterministic date/time for tool adapters |
| `IWeatherProvider` | Fetch weather data by location |

### Dependency Injection

No DI framework is used. All wiring is manual constructor injection. One rule: **only `infrastructure/container.ts`** may import concrete adapter classes and use case classes in the same file.

Wiring sequence in `container.ts`:
1. Instantiate secondary adapters (repositories, providers) with the MongoDB handle and SDK clients.
2. Instantiate use cases injecting port implementations via constructor.
3. Export a typed `container` object.

`infrastructure/trpc/context.ts` attaches use cases from the container to the tRPC context per request.

### Streaming Flow

```
User submits message
    → tRPC mutation (primary adapter)
    → SendMessageUseCase.execute()
    → IAIProvider.stream()          ← domain port
    → AiSdkProvider.stream()        ← secondary adapter
    → AI SDK streamText()
    → yields text deltas + tool_result events
    → ReadableStream to browser (SSE)
    → text chunks appended live / ToolResultCard rendered per tool call
    → stream ends → full assistant message + tool results persisted to DB
```

Streaming components (`StreamingMessage`, `ToolResultCard`) are CSR-only and never server-rendered.

---

## Technical Decisions

### 1. Hexagonal Architecture over layered MVC

**Chosen:** Hexagonal (Ports & Adapters)  
**Alternative considered:** Traditional layered architecture (Controller → Service → Repository)

The project has multiple external systems (MongoDB, AI SDK, BetterAuth, Weather API). A layered architecture would couple use cases to concrete adapters, making it impossible to test business logic without spinning up real infrastructure. Hexagonal keeps the domain pure — use cases receive typed port interfaces and never import from `infrastructure/`. The cost is more ceremony up front (defining port interfaces); the benefit is test isolation and the ability to swap adapters without touching business logic.

### 2. Bun as runtime over Node.js

**Chosen:** Bun 1.x  
**Alternative considered:** Node.js 20 LTS

Bun provides native TypeScript execution (no `tsc` step in dev), a significantly faster install and startup time, and a built-in test runner (`bun:test`) that integrates directly with TypeScript without transpilation setup. The AI SDK and MongoDB driver are both fully compatible. The tradeoff is a younger ecosystem with occasional rough edges on Alpine Docker images (e.g., `corepack` is not bundled — addressed in the Dockerfile with `apk add nodejs npm`).

### 3. tRPC over REST

**Chosen:** tRPC v11  
**Alternative considered:** REST with OpenAPI / Zod-validated Express routes

tRPC gives end-to-end type safety without any schema generation or code-gen step. The frontend's `useQuery` and `useMutation` hooks are typed directly to the server's router — changing a procedure's input or output shape causes a TypeScript error at the call site. `packages/shared` contains the router type so both apps share the contract without duplication. The tradeoff is tRPC coupling — the frontend and backend must share the same language/type system — which is not a constraint in this monorepo.

### 4. MongoDB Native Driver over an ORM

**Chosen:** `mongodb` native driver with typed `Collection<T>`  
**Alternative considered:** Mongoose, Prisma (with MongoDB adapter)

The native driver gives explicit control over document shape, query projection, and index creation. Collections are typed with `Collection<Chat>` / `Collection<Message>`, providing full TypeScript inference without a code-gen step. Mongoose would add schema duplication (Mongoose schema + Zod schema + TypeScript type for the same entity). Prisma's MongoDB support is production-ready but adds a migration layer that is unnecessary for this schema.

### 5. TanStack Start (SSR) over a pure SPA

**Chosen:** TanStack Start with server-side rendering  
**Alternative considered:** Vite SPA (CRA-style, no SSR)

The `/auth` route needs server-side session validation before the first byte is sent — without SSR, there is always a flash where the page renders, then redirects. The `/chat` route benefits from server-prefetched chat and message data so the initial paint includes real content without a loading skeleton. TanStack Start's server loaders integrate directly with TanStack Query's hydration API, making the transition from server-rendered to client-interactive seamless. Streaming (AI responses) is always CSR; the SSR shell does not attempt to render live streams.

### 6. BetterAuth over custom JWT logic

**Chosen:** BetterAuth v1  
**Alternative considered:** Hand-rolled JWT (jsonwebtoken + custom session management)

BetterAuth provides a production-grade session lifecycle (creation, validation, expiry, revocation) without requiring custom JWT signing logic, refresh token rotation, or CSRF handling. It integrates with MongoDB natively and exposes a typed server interface that works inside the Hono adapter. The only tradeoff is an additional dependency; the benefit is not reinventing security-critical infrastructure under time pressure.

---

## AI-Assisted Workflow

### Overview

This project was developed end-to-end with Claude using a structured spec-driven workflow powered by **OpenSpec** — a change-management layer that enforces a `propose → design → spec → tasks → implement → archive` loop for each feature.

Each of the 16 steps in `openspec/plan.md` became an OpenSpec **change**. For each change:

1. `/opsx:propose` — Claude generated `proposal.md` (why), `design.md` (how), `specs/<capability>/spec.md` (what, as testable requirements), and `tasks.md` (implementation checklist).
2. `/opsx:apply` — Claude worked through each task, writing code, marking tasks complete as it went.
3. `/opsx:archive` — The completed change was moved to `openspec/changes/archive/` with a datestamp.

This loop made it easy to pause, redirect, or override decisions at every phase without losing context.

### Models Used

| Model | Tasks |
|-------|-------|
| **Claude Sonnet 4.6** | Primary model throughout — architecture proposals, spec writing, all implementation tasks, debugging |

### Representative Prompts

**Planning phase** — generating a change spec for the backend domain layer:
```
Usa opsx:propose para el paso 3 del plan: backend domain layer.
Lee requirements.md y diagrams.md antes de generar la propuesta.
```

**Implementation phase** — applying tasks for a specific step:
```
Ejecuta opsx:apply para implementar los cambios del paso 7 (primary adapters).
```

**Debugging phase** — fixing a Docker build failure mid-session:
```
execute steps 5.1 and 5.2 of openspec/docker-deploy
```
Claude identified that `corepack` is not available in `oven/bun:1-alpine`, proposed three fix options, and applied the chosen one before retrying the build. It also caught a `pnpm-lock.yaml` config mismatch and regenerated the lockfile locally before re-running `docker compose build`.

**Review phase** — redirecting a proposed fix:
```
[user rejected the edit]
execute steps 5.1 and 5.2 of openspec/docker-deploy
```
Claude paused, explained the root cause and three alternatives, and waited for direction rather than guessing.

### Honest Assessment

**What the AI got right:**

- **Spec coherence.** The generated specs stayed consistent with `requirements.md` and `diagrams.md` across all 16 steps — no contradictions in port interfaces, entity shapes, or naming conventions.
- **Architectural faithfulness.** Every implementation step respected the Hexagonal dependency rule without prompting. Use cases were never imported into `domain/`; `container.ts` remained the single wiring point.
- **Tooling fluency.** Bun's native TypeScript, tRPC v11's streaming API, and TanStack Start's server loader pattern were all used correctly on the first attempt.

**Where human judgment was required:**

- **Build environment quirks.** The `corepack`-in-Alpine issue was caught at runtime, not at spec time. The spec described *what* to install; the *how* required a decision point.
- **Design trade-offs.** For decisions like "SSR vs SPA" and "native driver vs ORM," Claude presented clear options but the final call on each was human.
- **Prompt rejection.** Claude occasionally over-proposed (e.g., editing a Dockerfile before explaining the issue). Rejecting a tool call and re-issuing the same command was an effective way to get the explanation-first approach.

---

## What Would Be Improved

**1. Streaming message persistence**  
Currently, the full assistant message (including all tool results) is persisted to MongoDB only after the stream ends. Under a long AI response, a connection drop loses the entire message. A better approach would be to persist text deltas incrementally or use a write-ahead approach with a `streaming` status flag. Deferred due to time; the persistence logic is isolated in `SendMessageUseCase`, making it a focused change.

**2. Integration test coverage**  
Unit tests cover use cases with mocked ports. There are no integration tests exercising the full HTTP stack (Hono → tRPC → real MongoDB). The Hexagonal structure makes these straightforward to add (spin up a real MongoDB, instantiate `container.ts`, call the Hono app via `@hono/testing`), but wiring up test fixtures and seed data takes time that was allocated elsewhere.

**3. Optimistic UI for chat mutations**  
Rename, pin, and delete operations trigger a server round-trip before the sidebar updates. TanStack Query supports optimistic updates out of the box — the mutation can update the cache immediately and roll back on error. Omitted in favour of correctness over perceived performance.

**4. Rate limiting and input validation at the HTTP boundary**  
All tRPC inputs are Zod-validated, but there is no rate limiting on the `messages.send` procedure. A single authenticated user could exhaust the AI API budget with a fast client. A per-user token-bucket rate limiter at the Hono middleware layer would be the right fix; deferred because it requires a Redis or in-memory store decision that is out of scope for the challenge.

**5. Virtual scrolling for long conversation threads**  
`MessageList` renders all messages in a conversation as a flat list. For long threads this becomes a performance issue. `@tanstack/react-virtual` integrates directly with TanStack Query's paginated data and would fix this; omitted because the challenge scenarios don't involve threads long enough to trigger it.

**6. Frontend error boundaries and retry UI**  
Network errors during streaming are caught but surface as a generic error state. A retry button that re-sends the last user message, combined with a React error boundary that isolates streaming failures to the conversation pane, would significantly improve resilience. The hooks and mutation state are already in place; only the UI layer is missing.
