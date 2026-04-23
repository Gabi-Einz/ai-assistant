## Why

`packages/shared` was scaffolded as an empty barrel in the monorepo bootstrap step. Without shared types and Zod schemas, both `apps/api` and `apps/web` would be forced to duplicate entity shapes, tool payload definitions, and streaming event types — creating drift and breaking end-to-end type safety across the tRPC boundary.

## What Changes

- Add `src/schemas/tool-payloads.schema.ts` — Zod schemas for all three AI tool payloads (`get_date`, `get_time`, `get_weather`) with `z.infer<>` derived types
- Add `src/schemas/stream-event.schema.ts` — Zod schema and TypeScript type for `StreamEvent` discriminated union (`text` delta | `tool_result`)
- Add `src/types/chat.types.ts` — pure TypeScript types for `Chat`, `ChatDto`, and `ToolResult` (no Zod dependency)
- Add `src/types/message.types.ts` — pure TypeScript types for `Message`, `MessageDto`, and `MessageRole`
- Update `src/index.ts` barrel to re-export all schemas and types with clean named exports
- Add `zod` as a dependency in `packages/shared/package.json`

## Capabilities

### New Capabilities

- `shared-tool-payloads`: Zod schemas and inferred types for `get_date`, `get_time`, and `get_weather` tool payloads — shared between backend `execute()` functions and frontend `ToolResultCard` component registry
- `shared-entity-types`: Pure TypeScript types for `Chat` and `Message` entities, their DTOs, and `ToolResult` — no framework dependencies, safe to import from both `apps/api` domain and `apps/web`
- `shared-stream-events`: `StreamEvent` discriminated union type and Zod schema used by `AiSdkProvider`, tRPC streaming procedures, and frontend streaming renderer

### Modified Capabilities

*(none — no existing specs change)*

## Impact

- `packages/shared`: gains `zod` as a direct dependency; `src/index.ts` goes from empty to a full re-export barrel
- `apps/api`: domain entities and application DTOs will reference types from `@repo/shared`; tool adapters will import payload schemas for validation
- `apps/web`: frontend streaming renderer and `ToolResultCard` registry will import `ToolPayload` union and individual payload types
- No breaking changes — this is purely additive
