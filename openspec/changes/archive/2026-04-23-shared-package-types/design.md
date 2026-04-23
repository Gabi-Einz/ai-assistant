## Context

`packages/shared` is the single source of truth for contracts that cross the `apps/api` ↔ `apps/web` boundary. The monorepo bootstrap created the package scaffold (empty barrel, tsconfig, package.json). This change fills it with the three categories of shared types needed before any app-layer code can be written:

1. **Tool payload schemas** — validated at runtime by Zod in the backend `execute()` functions; inferred static types consumed by the frontend `ToolResultCard` registry.
2. **Entity types** — pure TypeScript shapes for `Chat` and `Message`; used in domain entities (`apps/api`) and in TanStack Query caches (`apps/web`).
3. **Stream event types** — the `StreamEvent` discriminated union emitted by `AiSdkProvider` and consumed by the SSE renderer on the frontend.

Constraint: `packages/shared` must have zero framework imports. It is consumed by both the Bun backend and the Vinxi/React frontend, so it must compile cleanly in both environments.

## Goals / Non-Goals

**Goals:**
- Define all Zod schemas for tool payloads with `z.infer<>` derived types
- Define pure TypeScript types for `Chat`, `Message`, `ToolResult`, and their DTOs
- Define `StreamEvent` discriminated union and `ToolPayload` union
- Export everything through a clean `src/index.ts` barrel
- Add `zod` as the only non-dev dependency

**Non-Goals:**
- No tRPC router type re-exports (the `AppRouter` type lives in `apps/api`; frontend imports it via a direct path alias or peer package — this avoids a circular dependency)
- No validation logic beyond Zod schema definitions
- No runtime utilities (helpers, formatters, etc.) — types and schemas only

## Decisions

### D1 — Zod for tool payloads, plain TypeScript for entity types

Tool payloads need runtime validation because they cross an external boundary (AI SDK tool call output). Zod is the right choice there.

Entity types (`Chat`, `Message`) are defined as plain TypeScript interfaces rather than Zod schemas. The backend validates MongoDB documents using typed `Collection<T>` from the native driver, not Zod; the frontend never validates entity shapes at runtime. Adding Zod schemas for entities would add schema maintenance overhead with no consumer.

*Alternative considered*: Zod for everything. Rejected — over-engineering for internal types that never arrive from untrusted external sources.

### D2 — `ToolPayload` as a discriminated union keyed by `toolName`

```ts
type ToolPayload =
  | { toolName: 'get_date'; payload: GetDatePayload }
  | { toolName: 'get_time'; payload: GetTimePayload }
  | { toolName: 'get_weather'; payload: GetWeatherPayload }
```

This lets the frontend's `ToolResultCard` switch on `toolName` with full type narrowing, and the backend's `StreamEvent` carries a fully typed payload without a generic parameter.

*Alternative considered*: `Record<string, unknown>` with a separate type map. Rejected — loses exhaustiveness checking when adding new tools.

### D3 — Barrel exports organized by category

```
src/
  schemas/
    tool-payloads.schema.ts   ← Zod schemas + inferred types
    stream-event.schema.ts    ← StreamEvent Zod schema + type
  types/
    chat.types.ts             ← Chat, ChatDto, ToolResult interfaces
    message.types.ts          ← Message, MessageDto, MessageRole type
  index.ts                    ← re-exports everything
```

Each file exports only what it owns. `index.ts` re-exports with explicit named exports — no wildcard `export *` to keep tree-shaking effective and imports predictable.

### D4 — `MessageRole` as a string literal union, not an enum

```ts
type MessageRole = 'user' | 'assistant'
```

TypeScript enums serialize awkwardly with MongoDB and JSON. String literal unions serialize naturally and satisfy strict Zod validation without an adapter.

## Risks / Trade-offs

- **`AppRouter` type not in shared** → Frontend must reference `apps/api` types via a tsconfig `paths` alias pointing directly into the API source. This is acceptable for a monorepo but means a clean package boundary is not enforced. Mitigation: document the alias convention; revisit if the API becomes a separate deployable.
- **Adding a new tool requires updating `ToolPayload` union** → This is intentional — the union is the registry. The change is one line in `tool-payloads.schema.ts` and the compiler enforces exhaustiveness everywhere the union is consumed.
