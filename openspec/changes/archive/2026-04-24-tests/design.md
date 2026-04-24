## Context

The backend follows Hexagonal Architecture. Use cases depend only on port interfaces, making them trivially unit-testable by supplying inline mock implementations. No tests exist today. The runtime is Bun, so `bun:test` is the natural choice. Hono provides `@hono/testing` for lightweight HTTP integration tests without spinning up a real server.

## Goals / Non-Goals

**Goals:**
- Unit-test all eight use cases (happy paths + error paths) with mock port interfaces
- Integration-test tRPC procedures through the real Hono app using `@hono/testing`
- Achieve high coverage of business logic (error guards, streaming orchestration, auth checks)

**Non-Goals:**
- No real MongoDB connections in any test
- No real AI SDK calls in any test
- No frontend tests in this change
- No e2e browser tests

## Decisions

**bun:test** — already the runtime; zero additional dependencies. Native `mock()` and `spyOn()` utilities available.

**Manual port mocks** — port interfaces are small. Inline implementations (`const mockRepo: IChatRepository = { create: mock(...), ... }`) are simpler, more explicit, and faster than a mocking library. Each test file instantiates the use case directly with its mocks.

**Test location** — `apps/api/src/__tests__/unit/` for use case tests and `apps/api/src/__tests__/integration/` for Hono/tRPC tests. Mirror the source tree under `__tests__/unit/` (e.g., `use-cases/chat/create-chat.test.ts`).

**Integration test approach** — `@hono/testing` wraps the real `createApp()` factory. Auth middleware reads the session from a cookie; tests inject a fake BetterAuth adapter that always returns a known `userId` when a `test-session` cookie is present. The tRPC context receives real use case instances built with the same mock repositories used in the test.

**Streaming in unit tests** — `SendMessageUseCase` yields an `AsyncGenerator`. Tests collect all yielded events via `for await` and assert on the collected array. The mock `IAIProvider` emits a fixed sequence of events.

## Risks / Trade-offs

[Tight coupling to port interface shapes] → Mitigation: mocks implement the full interface; TypeScript catches drift at compile time.

[Integration tests duplicate some unit test coverage] → Accepted; the integration layer validates the wiring (context injection, error mapping to TRPCError codes).

[Auth faking is fragile] → The fake auth adapter is test-only and not exported from production code; it never reaches the container.
