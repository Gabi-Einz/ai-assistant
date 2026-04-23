# Requirements

## Project Overview

Fullstack AI assistant challenge. Two screens: `/auth` (register/login) and `/chat` (AI assistant interface). The system must support multiple conversations per user, real-time streaming, and an extensible tool-calling architecture with typed payloads and dedicated UI components.

---

## Actors

| Actor | Description |
|-------|-------------|
| **Anonymous User** | Can access `/auth` to register or log in |
| **Authenticated User** | Can access `/chat`, manage conversations, and interact with the AI assistant |
| **AI Agent** | Responds to user messages using tools; operates via streaming |

---

## Tech Stack

### Monorepo
- **pnpm** — package manager
- **Turborepo** — monorepo build orchestration

### Shared
- **TypeScript** — strict typing throughout; no `any`, no unnecessary casts
- **Zod** — schema validation and type inference at all boundaries
- **tRPC** — end-to-end typesafe API layer between frontend and backend
- **AI SDK** (`ai-sdk.dev`) — streaming, tool calling, and agent orchestration

### Frontend (`apps/web`)
- **React 19** — UI library
- **TanStack Start** — SSR meta-framework built on Vinxi; enables server-side rendering and server loaders for TanStack Router
- **TanStack Router** — file-based routing with URL state management
- **TanStack Form** — form state management
- **TanStack Query** — server state, caching, infinite scroll
- **HeroUI** — React component library (dark theme)
- **BetterAuth** (client) — session management and auth UI integration

### Backend (`apps/api`)
- **Bun** — runtime
- **Hono** — HTTP framework
- **MongoDB Native Driver** — direct driver (no ORM); typed collections
- **BetterAuth** (server) — authentication and session handling

---

## Architecture

### Monorepo Layout

```
/
├── apps/
│   ├── web/          # Frontend (TanStack Start + TanStack Router)
│   └── api/          # Backend (Bun + Hono) — Hexagonal Architecture
├── packages/
│   └── shared/       # Shared Zod schemas, tRPC router types, tool payload types
├── openspec/
├── pnpm-workspace.yaml
└── turbo.json
```

### Hexagonal Architecture Principles

The backend (`apps/api`) follows Hexagonal Architecture (Ports & Adapters). The **Dependency Rule** is absolute: all source-code dependencies point inward toward the domain. The domain has no knowledge of the application layer; the application layer has no knowledge of infrastructure. Framework code, database drivers, HTTP handlers, and AI SDK calls are infrastructure concerns isolated in the outermost layer.

Three concentric layers:

- **Domain** (`src/domain/`) — entities, value objects, domain errors, and port interfaces. Zero imports from any framework, library, or outer layer. Pure TypeScript.
- **Application** (`src/application/`) — use cases and DTOs. Depends only on the domain layer. Orchestrates domain objects and invokes ports.
- **Infrastructure** (`src/infrastructure/`) — all adapters: HTTP (Hono), API (tRPC), repositories (MongoDB), AI (AI SDK), auth (BetterAuth), tools, and the DI composition root. Depends on both application and domain layers.

### Backend Directory Tree (`apps/api/src/`)

```
apps/api/src/
├── domain/
│   ├── entities/
│   │   ├── chat.entity.ts             # Chat aggregate — shape + business rules
│   │   └── message.entity.ts          # Message aggregate — shape + business rules
│   ├── ports/
│   │   ├── chat-repository.port.ts    # IChatRepository interface
│   │   ├── message-repository.port.ts # IMessageRepository interface
│   │   ├── ai-provider.port.ts        # IAIProvider interface
│   │   ├── datetime-provider.port.ts  # IDateTimeProvider interface
│   │   └── weather-provider.port.ts   # IWeatherProvider interface
│   └── errors/
│       ├── chat-not-found.error.ts
│       └── unauthorized.error.ts
│
├── application/
│   ├── use-cases/
│   │   ├── chat/
│   │   │   ├── create-chat.use-case.ts
│   │   │   ├── delete-chat.use-case.ts
│   │   │   ├── rename-chat.use-case.ts
│   │   │   ├── pin-chat.use-case.ts
│   │   │   ├── list-chats.use-case.ts
│   │   │   └── search-chats.use-case.ts
│   │   └── message/
│   │       ├── send-message.use-case.ts
│   │       └── list-messages.use-case.ts
│   └── dtos/
│       ├── chat.dto.ts
│       └── message.dto.ts
│
└── infrastructure/
    ├── http/
    │   └── app.ts                     # Hono app factory; mounts all routes
    ├── trpc/
    │   ├── router.ts                  # Root tRPC router
    │   ├── context.ts                 # Wires use cases from container into tRPC context
    │   ├── routers/
    │   │   ├── chat.router.ts
    │   │   └── message.router.ts
    │   └── middleware/
    │       └── auth.middleware.ts
    ├── repositories/
    │   ├── mongo-chat.repository.ts   # Implements IChatRepository
    │   └── mongo-message.repository.ts # Implements IMessageRepository
    ├── ai/
    │   └── ai-sdk.provider.ts         # Implements IAIProvider
    ├── tools/
    │   ├── index.ts                   # Tool registry (barrel)
    │   ├── get-date.tool.ts
    │   ├── get-time.tool.ts
    │   └── get-weather.tool.ts
    ├── auth/
    │   └── better-auth.adapter.ts     # BetterAuth server setup
    └── container.ts                   # Composition root — single DI wiring point
```

### Ports Catalogue

| Port Interface | File | Purpose |
|---|---|---|
| `IChatRepository` | `domain/ports/chat-repository.port.ts` | CRUD on chat aggregates: create, findById, list (paginated, sorted), searchByTitle, rename, togglePin, delete |
| `IMessageRepository` | `domain/ports/message-repository.port.ts` | Persist a new message; retrieve all messages for a `chatId` ordered by `createdAt` ASC |
| `IAIProvider` | `domain/ports/ai-provider.port.ts` | Stream an AI response given message history and a tool registry; yields text deltas and typed tool-call events |
| `IDateTimeProvider` | `domain/ports/datetime-provider.port.ts` | Return current date and time as typed values; used by `get_date` and `get_time` tool adapters for deterministic testability |
| `IWeatherProvider` | `domain/ports/weather-provider.port.ts` | Fetch current weather data for a given location; returns a typed payload consumed by the `get_weather` tool adapter |

### Dependency Injection Strategy

**No DI framework is used.** Dependencies are wired manually via constructor injection. The single DI rule: only `infrastructure/container.ts` is permitted to import across layers.

Wiring sequence in `container.ts`:

1. Instantiate secondary adapters (repositories, providers) with the MongoDB handle and external SDK clients.
2. Instantiate all use cases, injecting the port implementations from step 1 via constructor.
3. Export a typed `container` object containing all use case instances.

`infrastructure/trpc/context.ts` imports the container and attaches use cases to the tRPC context per request. `infrastructure/http/app.ts` imports the container once to mount the tRPC adapter and BetterAuth adapter.

Rules:
- Use cases declare constructor dependencies typed to port interfaces (e.g., `IChatRepository`), never to concrete classes.
- `container.ts` is the only file that imports concrete adapter classes and use case classes together.
- Nothing in `domain/` or `application/` may import from `infrastructure/`.

### Request Flow

```
PRIMARY ADAPTERS (infrastructure)
    tRPC Routers / Hono HTTP handlers
               │
               ▼
     APPLICATION LAYER
     Use Cases — e.g., SendMessageUseCase
               │   ▲
               │   │  port interfaces
               ▼   │
       DOMAIN LAYER
       Entities + Port Interfaces (pure TypeScript)
               │
               ▼
SECONDARY ADAPTERS (infrastructure)
    ┌──────────────────────────────────────┐
    │  MongoChat/MessageRepository         │
    │  AiSdkProvider                       │
    │  BetterAuth adapter                  │
    └──────────────────────────────────────┘
```

Primary adapters translate HTTP/tRPC requests into use case invocations. Use cases coordinate domain logic and call secondary ports. Secondary adapters implement those ports and communicate with external systems. The domain layer has no outward arrows — it is the stable core.

### Streaming Flow

```
User sends message → tRPC mutation (primary adapter)
                               │
                      SendMessageUseCase (application)
                               │
                      IAIProvider.stream() (domain port)
                               │
                     AiSdkProvider.stream() (secondary adapter)
                               │
              AI SDK streamText() with registered tools
                               │
         Stream deltas → frontend via ReadableStream
                               │
   Text chunks + tool result events rendered as dedicated UI components
```

### Database Design (MongoDB)

Collections:

- **users** — managed by BetterAuth
- **sessions** — managed by BetterAuth
- **chats** — `{ _id, userId, title, isPinned, createdAt, updatedAt }`
- **messages** — `{ _id, chatId, userId, role, content, toolResults[], createdAt }`

Indexes: `chats(userId, updatedAt)`, `messages(chatId, createdAt)`, `chats(userId, title)` (text index for search).

### Frontend Architecture Notes

The frontend (`apps/web`) does not apply hexagonal layering — its scope does not warrant it. Key structural notes:

- The **tRPC client** is the primary adapter on the frontend: it translates TanStack Query hooks into typed backend calls.
- **TanStack Query** manages all server state: loading, error, caching, infinite scroll, and optimistic updates.
- **Shared types** from `packages/shared` are the canonical data contracts between frontend and backend. No duplication of entity shapes.
- Tool payload types are defined once in `packages/shared` and consumed by both the backend tool `execute` functions and the frontend UI component registry (`toolName → UIComponent`).

### Rendering Strategy

| Route | Strategy | Reason |
|-------|----------|--------|
| `/auth` | **SSR** | Session is validated server-side before render; unauthenticated users never receive a flash of protected UI |
| `/chat` (initial load) | **SSR** | Chat list and selected conversation are pre-fetched on the server; first paint includes real data without a loading state |
| `/chat` (streaming) | **CSR** | AI response streaming requires a live browser connection (ReadableStream / SSE); this part is always client-rendered |

Rules:
- On `/auth`: if a valid session exists, redirect to `/chat` happens server-side — no client-side redirect needed.
- On `/chat` initial render: TanStack Router's loader runs server-side to pre-fetch the chat list and the first page of messages for the active `chatId`; TanStack Query is hydrated with that data.
- Once the page is interactive, all subsequent mutations and streaming (send message, tool calls, real-time deltas) are **CSR only** — no server round-trip before the stream begins.
- Components that depend on streaming state (`StreamingMessage`, `ToolResultCard`) are explicitly marked as client-only and are never server-rendered.

---

## Workflows

### Authentication

1. User navigates to `/auth`
2. Selects register or login tab
3. Fills form (managed by TanStack Form, validated with Zod)
4. Submits → tRPC mutation → BetterAuth handler
5. On success: session cookie set, redirect to `/chat`

### Chat Session

1. Authenticated user lands on `/chat`
2. Sidebar loads recent chats (infinite scroll via TanStack Query)
3. User selects a chat or creates a new one → `chatId` written to URL
4. Chat messages loaded for selected `chatId`
5. User types and submits a message
6. Message persisted to DB, then streamed to AI SDK
7. AI response streamed back; text chunks appended in real time
8. If a tool is called: tool result rendered as a dedicated UI component (not inline text)
9. Stream ends → full message and tool results persisted to DB

### Chat Management

- **Rename**: inline edit on chat title → tRPC mutation → DB update
- **Pin/Unpin**: toggle `isPinned` flag → re-sorted in sidebar
- **Delete**: confirm → tRPC mutation → remove chat + all messages
- **Search**: text input bound to URL param `q` → debounced → filtered list from DB text index

---

## Conventions

### TypeScript
- `strict: true` in all `tsconfig.json` files
- No `any`; use `unknown` + type narrowing or Zod inference
- All MongoDB documents typed via generic `Collection<T>` from the native driver
- Shared types exported from `packages/shared`
- Variables and functions use `camelCase` in English — names must be descriptive enough to understand intent without reading the implementation (e.g., `findChatsByUserId`, `isMessageStreaming`, `togglePinnedStatus`)

### Zod
- Every tRPC input validated with a Zod schema
- Tool payloads defined as Zod schemas; inferred types shared to frontend
- Auth form schemas defined once and reused for both form validation and tRPC input

### tRPC
- Routers colocated with their domain (`chats.router.ts`, `messages.router.ts`)
- Procedures: `query` for reads, `mutation` for writes, `subscription` or SSE for streaming
- Auth context injected via middleware; all chat/message procedures require authenticated context
- `context.ts` is the boundary where use case instances from the container are attached to the request context; procedures receive typed use cases, not raw repositories

### AI Tools
- Each tool defined as a module exporting `{ name, description, schema, execute }`
- `execute` returns a typed payload matching the Zod schema
- New tools are registered in a single `tools/index.ts` barrel — no changes needed elsewhere
- Frontend maps `toolName → UIComponent` in a single registry file
- Tool `execute` functions receive their external dependencies (e.g., `IDateTimeProvider`, `IWeatherProvider`) via constructor injection from the container — they do not import concrete providers directly

### Git / Commits
- Conventional Commits: `feat:`, `fix:`, `chore:`, `refactor:`
- One commit per logical unit of work

### File Naming
- `kebab-case` for files and folders
- React components: `PascalCase.tsx`
- tRPC routers: `<domain>.router.ts`
- Zod schemas: `<domain>.schema.ts`
- Port interfaces: `<noun>.port.ts` — e.g., `chat-repository.port.ts`
- Use cases: `<verb>-<noun>.use-case.ts` — e.g., `send-message.use-case.ts`
- Repository adapters: `<db>-<noun>.repository.ts` — e.g., `mongo-chat.repository.ts`
- Provider adapters: `<lib>-<noun>.provider.ts` — e.g., `ai-sdk.provider.ts`
- Protocol adapters: `<noun>.adapter.ts` — e.g., `better-auth.adapter.ts`
- Composition root: always `container.ts`

### Hexagonal Architecture
- Port interfaces are named with an `I` prefix: `IChatRepository`, `IAIProvider`, `IMessageRepository`, `IDateTimeProvider`, `IWeatherProvider`.
- `src/domain/` MUST NOT import from `src/application/` or `src/infrastructure/`.
- `src/application/` MUST NOT import from `src/infrastructure/`. Use cases receive all external dependencies through port interfaces injected via constructor.
- `infrastructure/container.ts` is the **only** file permitted to import concrete adapter classes alongside use case classes in the same file.
- When adding a new capability: (1) define a port in `domain/ports/`, (2) create/extend a use case in `application/use-cases/`, (3) implement the adapter in `infrastructure/`, (4) wire in `container.ts`. No other files change.

---

## Functional Requirements

### `/auth`
- [ ] Register form: email + password (TanStack Form + Zod)
- [ ] Login form: email + password (TanStack Form + Zod)
- [ ] Redirect to `/chat` on success
- [ ] Show field-level validation errors

### `/chat` — Sidebar
- [ ] List of chats sorted by `updatedAt` desc, pinned chats first
- [ ] Infinite scroll (TanStack Query `useInfiniteQuery`)
- [ ] Search by title (URL param `q`, debounced, MongoDB text index)
- [ ] Pin / unpin chat
- [ ] Rename chat (inline)
- [ ] Delete chat (with confirmation)

### `/chat` — Conversation
- [ ] Load messages for selected `chatId` (from URL)
- [ ] Send message → persist → stream AI response
- [ ] Streaming text rendered incrementally
- [ ] Tool results rendered as dedicated components (not text)
- [ ] Indicator showing which tool was used
- [ ] Empty, loading, and error states handled

### AI Tools
- [ ] `get_date` — returns current date; rendered as `DateCard` component
- [ ] `get_time` — returns current time; rendered as `TimeCard` component
- [ ] `get_weather` — returns current weather (location from user context or prompt); rendered as `WeatherCard` component

---

## Technical Constraints

| Constraint | Detail |
|------------|--------|
| **No ORM** | Use MongoDB Native Driver directly with typed collections |
| **No `any`** | TypeScript strict mode; Zod for all runtime unknowns |
| **Streaming required** | AI messages must use AI SDK streaming, not request/response |
| **URL state** | Active `chatId` and search query `q` must live in the URL |
| **DB persistence** | All chats, messages, and metadata persisted; no in-memory state |
| **Scalability** | Schema must support many conversations per user and future history extensions |
| **Extensible tools** | Adding a new tool requires only: a new tool module + a new UI component registration |
| **Typed tool payloads** | Tool results use Zod-inferred types shared between backend and frontend |
| **Naming language** | All variable names, function names, and identifiers must be in English using `camelCase`; names must be descriptive enough to convey intent without reading the implementation |
| **UI simplicity** | UI must be simple and functional — no decorative complexity; every element serves a clear purpose; consistent spacing, typography, and feedback states across all screens |
| **UI theme** | Dark theme only; no light mode or theme toggle required |
| **Deployment** | Frontend on Vercel; backend deployable (Bun-compatible host) |
| **Auth** | BetterAuth only; no custom JWT logic |
| **SSR for auth & initial load** | `/auth` and initial `/chat` render are server-side; session validation and data pre-fetch happen before the first byte is sent to the browser |
| **CSR for streaming** | AI response streaming (SSE / ReadableStream) is always client-side; streaming components are never server-rendered |
