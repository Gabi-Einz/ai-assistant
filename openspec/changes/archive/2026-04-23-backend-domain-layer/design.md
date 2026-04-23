## Context

Steps 1 (monorepo bootstrap) and 2 (packages/shared types) are complete. This step establishes `apps/api/src/domain/` — the innermost layer of the hexagonal architecture. All future backend work (application use cases, infrastructure adapters) depends on this layer being stable and well-typed before any implementation begins.

The domain layer is constrained to pure TypeScript: no framework imports, no database drivers, no Zod, no AI SDK. Its only permitted external import is `@repo/shared`, which is itself a pure types-and-schemas package.

## Goals / Non-Goals

**Goals:**
- Define Chat and Message entity shapes as TypeScript interfaces with zero runtime footprint
- Define all five port interfaces that delineate the domain/infrastructure boundary
- Define two typed domain error classes for use-case-level error handling
- Ensure no file in `src/domain/` imports from `src/application/` or `src/infrastructure/`
- Ensure TypeScript strict mode is satisfied with no `any` or unconstrained generics

**Non-Goals:**
- Implementing port interfaces — that belongs in `src/infrastructure/`
- Defining use cases or orchestration logic — that belongs in `src/application/`
- Adding validation logic to entities — entities are pure data shapes; validation lives at the use-case input boundary (tRPC Zod schemas)
- Defining tRPC types, HTTP routes, or MongoDB collection bindings

## Decisions

**Entities as TypeScript interfaces, not classes**
Entity files export `interface` declarations. There is no constructor logic, no method attachment, and no prototype chain. This keeps entities fully serializable and compatible with MongoDB document shapes. Behavior (business rules) goes in use cases, not entities.

**`_id` typed as `string` in domain entities**
MongoDB's `ObjectId` type would introduce a driver import into the domain. Instead, `_id` is typed as `string`. The repository adapter (`MongoChatRepository`) is responsible for converting `ObjectId ↔ string` at the infrastructure boundary. This is a deliberate trade-off: the domain stays clean; the adapter absorbs the impedance mismatch.

**Port interfaces use `I` prefix convention**
As specified in requirements.md: `IChatRepository`, `IMessageRepository`, `IAIProvider`, `IDateTimeProvider`, `IWeatherProvider`. This prefix signals "this is an interface to be implemented elsewhere" and avoids naming collisions with concrete adapters.

**Domain errors extend the native `Error` class**
`ChatNotFoundError` and `UnauthorizedError` each extend `Error` with a typed constructor. No external error library is used. Use cases throw these; tRPC middleware catches them and maps to appropriate HTTP/tRPC error codes. `instanceof` checks remain reliable because no transpilation boundary obscures the prototype chain (Bun runs TypeScript natively).

**`@repo/shared` is an acceptable domain import**
`ToolPayload` and `StreamEvent` are defined in `packages/shared` and must be shared between frontend and backend. Importing them in the domain is acceptable because `@repo/shared` is itself a pure types package (no framework, no runtime side effects). This avoids duplicating type definitions across the monorepo.

**`IAIProvider.stream()` returns `AsyncIterable<StreamEvent>`**
Rather than exposing a callback or event emitter API, the port uses an `AsyncIterable`. This aligns with the AI SDK's streaming model and is natively supported by `for await...of` in TypeScript. The concrete adapter (`AiSdkProvider`) maps AI SDK chunks to `StreamEvent` values.

## Risks / Trade-offs

**[Risk] `@repo/shared` grows to include non-pure concerns** → Mitigation: `@repo/shared` is governed by its own spec (step 2); any change that adds framework or runtime dependencies there would be caught in its own change proposal. The domain layer's dependency on it is safe as long as that governance holds.

**[Risk] `string` for `_id` loses ObjectId ordering guarantees in domain logic** → Mitigation: The domain never sorts or compares `_id` values — that is a repository concern. Sorting by `createdAt` (a `Date`) is what all queries use.

**[Risk] `AsyncIterable<StreamEvent>` port signature requires the application layer to manage stream lifecycle** → Mitigation: `SendMessageUseCase` is the only use case that calls `IAIProvider.stream()`; it owns the `for await...of` loop and is responsible for persisting the completed message on stream end. This is documented in the use-case spec (step 4).
