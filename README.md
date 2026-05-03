# AI Assistant

A fullstack AI assistant challenge. Two screens — `/auth` (register/login) and `/chat` (multi-conversation AI interface with real-time streaming and extensible tool calling).

![pnpm](https://img.shields.io/badge/pnpm-9-orange) ![Bun](https://img.shields.io/badge/Bun-1-black) ![React](https://img.shields.io/badge/React-19-61DAFB) ![tRPC](https://img.shields.io/badge/tRPC-11-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-7-green)

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Running with Docker](#running-with-docker)
- [Commands](#commands)
- [Deployment](#deployment)
- [Features](#features)
- [Architecture](#architecture)
- [Diagrams](#diagrams)
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
| OpenAI API key | — | AI responses via gpt-4.1-nano ([platform.openai.com](https://platform.openai.com/api-keys)) |
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
| `AI_API_KEY` | Yes | OpenAI API key (used with gpt-4.1-nano) |
| `WEATHER_API_KEY` | Yes | OpenWeatherMap API key |
| `BETTERAUTH_SECRET` | Yes | Random string ≥ 32 characters used to sign sessions (`openssl rand -base64 32`) |
| `PORT` | No | API port (default: `3000`) |
| `API_URL` | No | Public base URL of the API — used by BetterAuth to build session URLs (default: `http://localhost:3000`) |
| `VITE_API_URL` | No | Backend URL consumed by the frontend (default: `http://localhost:3000`) |

---

## Running with Docker

Docker covers the **backend only** (API + MongoDB). The frontend runs locally against the containerised API. This matches the intended deployment split: the backend ships as a container, the frontend deploys to Vercel.

### 1. Start the backend

```bash
docker compose up --build -d
```

This starts MongoDB on `:27017` and the Hono API on `:3000`. No local Bun or MongoDB installation is needed.

Verify the API is running:

```bash
curl http://localhost:3000/trpc/chat.list
# → {"error":{"message":"UNAUTHORIZED",...}} — HTTP 401, not a connection error
```

### 2. Start the frontend

In a separate terminal, install dependencies and start the web dev server:

```bash
pnpm install
pnpm --filter @repo/web dev
```

The frontend is now available at `http://localhost:3001` and talks to the API at `http://localhost:3000` via `VITE_API_URL` in `.env`.

### Stopping the backend

```bash
docker compose down
```

> **Note:** MongoDB data is persisted in a named volume (`mongo_data`). Add `-v` to `docker compose down` to remove it.

---

To run tests:

```bash
pnpm --filter @repo/api test
```

To run tests with coverage report:

```bash
pnpm --filter @repo/api test:coverage
```

### Coverage report

Generated with `bun test --preload ./src/__tests__/setup.ts --coverage` (Bun v1.3.13):

```
---------------------------------------------------------------------|---------|---------|-------------------
File                                                                 | % Funcs | % Lines | Uncovered Line #s
---------------------------------------------------------------------|---------|---------|-------------------
All files                                                            |   83.50 |   93.95 |
 src/application/use-cases/chat/create-chat.use-case.ts              |  100.00 |  100.00 |
 src/application/use-cases/chat/delete-chat.use-case.ts              |  100.00 |  100.00 |
 src/application/use-cases/chat/list-chats.use-case.ts               |  100.00 |  100.00 |
 src/application/use-cases/chat/pin-chat.use-case.ts                 |  100.00 |  100.00 |
 src/application/use-cases/chat/rename-chat.use-case.ts              |  100.00 |  100.00 |
 src/application/use-cases/chat/search-chats.use-case.ts             |  100.00 |  100.00 |
 src/application/use-cases/message/list-messages.use-case.ts         |  100.00 |  100.00 |
 src/application/use-cases/message/send-message.use-case.ts          |  100.00 |  100.00 |
 src/domain/errors/chat-not-found.error.ts                           |  100.00 |  100.00 |
 src/domain/errors/unauthorized.error.ts                             |  100.00 |  100.00 |
 src/infrastructure/trpc/context.ts                                  |  100.00 |  100.00 |
 src/infrastructure/trpc/middleware/auth.middleware.ts                |  100.00 |  100.00 |
 src/infrastructure/trpc/router.ts                                    |  100.00 |  100.00 |
 src/infrastructure/trpc/routers/message.router.ts                   |  100.00 |   68.18 | 14-20
 src/infrastructure/trpc/routers/chat.router.ts                      |   62.50 |   74.24 | 11-14,42,48-64
 src/infrastructure/http/app.ts                                      |   60.00 |   54.55 | 14,27-50
 src/infrastructure/http/stream.route.ts                             |   50.00 |   15.38 | 9-41
---------------------------------------------------------------------|---------|---------|-------------------
```

All **application** and **domain** layers have 100% line coverage. Lower coverage in `infrastructure/http/` is expected — the stream route and CORS wrapper require a running AI provider and are covered by manual integration testing rather than automated tests.

---

## Commands

### Frontend

```bash
# Type checking
pnpm --filter @repo/web typecheck

# Production build
pnpm --filter @repo/web build
```

### Backend

```bash
# Type checking
pnpm --filter @repo/api typecheck

# Production build
pnpm --filter @repo/api build

# Tests
pnpm --filter @repo/api test

# Tests with coverage
pnpm --filter @repo/api test:coverage
```

---

## Deployment

The backend requires a persistent runtime (Docker + Bun) and is not compatible with Vercel serverless. The recommended stack is:

```
MongoDB Atlas (free M0)  ←  Railway (backend Docker)  ←  Vercel (frontend)
```

### 1. MongoDB Atlas

- Create a free M0 cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
- Under **Network Access**, add `0.0.0.0/0` to allow connections from Railway
- Copy the connection string: `mongodb+srv://user:pass@cluster.mongodb.net/ai_assistant`

### 2. Backend on Railway

- New project → **Deploy from GitHub repo**
- In **Settings → Build**, configure:
  - **Root Directory**: `/` (repo root)
  - **Dockerfile Path**: `apps/api/Dockerfile`
- Set the following environment variables in the Railway dashboard:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | Atlas connection string |
| `AI_API_KEY` | OpenAI API key |
| `WEATHER_API_KEY` | OpenWeatherMap API key |
| `BETTERAUTH_SECRET` | Random string ≥ 32 chars (`openssl rand -base64 32`) |
| `API_URL` | `https://your-app.railway.app` (Railway-assigned URL) |
| `WEB_URL` | `https://your-app.vercel.app` (Vercel-assigned URL — set after step 3) |

### 3. Frontend on Vercel

- New project → **Import from GitHub**
- **Root Directory**: `apps/web`
- Add the following as a **Build Environment Variable** (not just runtime):

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://your-app.railway.app` |

The `apps/web/vercel.json` is already configured with `NITRO_PRESET=vercel` and the correct output directory — no additional Vercel configuration is needed.

### Deployment order

Deploy the backend first to get its public URL, then deploy the frontend. Once Vercel assigns a URL, go back to Railway and set `WEB_URL` to that URL, then trigger a redeploy. This ensures CORS is correctly configured for the production frontend origin.

> **No code changes required.** `API_URL`, `WEB_URL`, the dynamic CORS handler, and `vercel.json` are already in place.

---

## Features

### Authentication
- Email/password register and login via BetterAuth
- Session-based auth with per-request validation on all tRPC procedures
- Logout button in the sidebar clears the React Query cache — switching accounts immediately shows the correct chat list without a page reload

### Chat Management
- Create, rename, pin/unpin, and delete conversations from the sidebar
- Infinite scroll pagination in the chat list
- Full-text search across conversation titles
- Active chat persisted in the URL (`?chatId=...`)

### AI Responses
- Real-time streaming via SSE — text appears as it is generated
- General-purpose assistant: answers any question directly from its knowledge
- Tool calling with up to 5 agentic steps per message (Vercel AI SDK `maxSteps`)

### Tool Calling UI
- When the AI uses a tool (`get_date`, `get_time`, `get_weather`), a button labelled with the tool name appears below the AI's text response
- Clicking the button (or automatically on first arrival during streaming) opens a popup showing the tool name and a purpose-built UI card with the result:
  - **DateCard** — formatted current date
  - **TimeCard** — formatted current time
  - **WeatherCard** — location, temperature, condition, and humidity
- The AI's text answer is shown in the chat bubble; the raw data lives only in the popup

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

### AI Provider

The `AiSdkProvider` wraps the Vercel AI SDK's `streamText` function using **OpenAI gpt-4.1-nano** as the model. It exposes the `IAIProvider` port, so the model can be swapped (e.g., to Anthropic Claude or Google Gemini) by replacing only the adapter without touching any use case or domain code.

Available tools injected at construction time:

| Tool | Description |
|------|-------------|
| `get_date` | Returns the current date from `IDateTimeProvider` |
| `get_time` | Returns the current time from `IDateTimeProvider` |
| `get_weather` | Fetches weather for a location via `IWeatherProvider` |

### Streaming Flow

```
User submits message
    → POST /api/stream (Hono route)
    → SendMessageUseCase.execute()
    → IAIProvider.stream()          ← domain port
    → AiSdkProvider.stream()        ← secondary adapter (gpt-4.1-nano)
    → Vercel AI SDK streamText()
    → yields text deltas → streamed to browser via SSE
    → yields tool_result events after all steps complete
    → stream ends → full assistant message + tool results persisted to DB
    → React Query cache invalidated → MessageList refetches
```

During streaming the frontend renders `StreamingMessage` (text bubble + cursor). When a `tool_result` event arrives, `ToolResultModal` opens automatically. After the stream ends the final `MessageBubble` shows the persisted message with a button to reopen the tool popup.

---

## Diagrams

Architecture, sequence, and component diagrams are available in [`openspec/diagrams.md`](openspec/diagrams.md).

> To render the Mermaid diagrams graphically in VS Code, install the [Markdown Preview Mermaid Support](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid) extension and open the file with **Markdown: Open Preview** (`Ctrl+Shift+V`).

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

### 7. Tool result popup over inline rendering

**Chosen:** Modal popup triggered by a button below the AI message  
**Alternative considered:** Inline card rendered directly inside the chat bubble

Rendering tool data (date, time, weather) inline mixes structured UI with the conversation flow and repeats information already present in the AI's text answer. A popup decouples the data visualisation from the chat thread — the text answer stays in the bubble and the structured data is available on demand. During streaming the popup opens automatically; for persisted messages a button labelled with the tool name reopens it.

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

### Used Prompts

- Please read openspec/project.md and help me creating another file called requirements.md following the OpenSpec standard with details about my project, tech stack, architecture, conventions, actors, workflows and Technical Constraints.
- /opsx:propose "Refactorizar la arquitectura del proyecto en requirements.md hacia un modelo Hexagonal (Ports & Adapters). Define la separación de capas, la regla de dependencia hacia el dominio y la estructura de directorios sugerida (src/domain, src/application, src/infrastructure). Ten en cuenta Dependency injection para las capas correspondientes en una arquitectura hexagonal.”
- Ten en cuenta que se debe usar SSR (Server-Side Rendering) para la autenticación y carga inicial. Para la experiencia de chat (streaming) debes usar CSR (Client-Side Rendering). Agregalo al archivo requirements.md
- Usa camelCase e ingles para nombramiento de variables y funciones que deben ser descriptivas para facil lectura del desarrollador. La UI debe ser simple y funcional. Agrega estas aclaraciones al archivo requirements.md
- Usa dark theme para la UI, agregalo al archivo requirements.md
- Genera diagrama de clases, diagramas de secuencia, diagrama de arquitectura y cualquier otro diagrama que consideres importante para el proyecto, para ello usa Mermaid.js y agregalos a openspec/diagrams.md
- Claude, lee `requirements.md` y `diagrams.md`. He creado un borrador en `plan.md`. Revísalo y dime si falta algún paso técnico para cumplir con los diagramas.
    - Claude, inicia el **paso 16** de `plan.md`. Usa `opsx:propose` para generar la especificación técnica. Lee `requirements.md` y `diagrams.md` para asegurar que la propuesta sea coherente con la arquitectura.
    - La propuesta para el paso 16 se ve correcta. Ejecuta `opsx:apply` para implementar los cambios.
    - El paso 16 está completado. Ejecuta `opsx:archive` y actualiza el `plan.md` marcando el paso como completado.

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

-Full chat history sent in every message (Cost + Correctness)
The SendMessageUseCase sends the entire chat history to the model without a limit. If a chat has 200 messages, it sends all of them in every request. This can exceed the context window of gpt-4.1-nano (1M tokens), makes the cost very high, and eventually causes a context_length_exceeded error.
Solution: Limit the history to the last N messages or by token count.

-No schema validation in stream route
The POST request body uses a type assertion (as { chatId... }) instead of real parsing. If the data is broken, it goes straight to the code.
Solution: Use a Zod schema to validate that chatId and content are correct.

-No pagination in message search
findByChatId() loads all messages from a chat into memory at once. For long chats, this uses too much RAM.
Solution: Use pagination to load only a few messages at a time.

-MongoDB has no password in Docker
The docker-compose.yml file starts MongoDB without a username or password. Anyone on the same network can read or delete the data.
Solution: Add credentials (Username/Password) to the config and the connection string.

-No graceful shutdown
The app does not listen for "stop" signals (SIGTERM). When Docker stops the container, MongoDB connections close instantly. This can corrupt data that is being written.
Solution: Add code to wait for operations to finish before closing.

-Chat search has no debounce
Every time you press a key in the search bar, it sends a request to the server. This is too many database queries.
Solution: Add a 300ms debounce so it only searches when the user stops typing.

-UI only shows the first tool result
If the AI uses two tools (like date + weather), the UI only shows the first one and ignores the second.
Solution: Change the code to show all tool results.

-Docker runs as root
The app runs as "root" (admin) inside the container. If there is a security bug, the hacker has full control.
Solution: Add USER bun in the Dockerfile to run the app with less power.

-Add enums to avoid hardcoded values.

-Migrate to NestJs to avoid manual Dependency Injection and get all the benefits of that framework.

-Add CI/CD tu run the project in every push with typecheck and tests.

-Add pretier. Prettier prevents every file from having different conventions for indentation, quotes, trailing commas, etc.—especially useful if there is more than one developer.

-Add swagger to document endpoints.

-Improve test coverage.