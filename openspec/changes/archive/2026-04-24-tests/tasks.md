## 1. Setup

- [x] 1.1 Add `"test": "bun test"` script to `apps/api/package.json` and create `apps/api/src/__tests__/unit/use-cases/chat/` and `apps/api/src/__tests__/integration/` directories
- [x] 1.2 Install `@hono/testing` as a dev dependency in `apps/api` if not already present

## 2. Chat Use Case Unit Tests

- [x] 2.1 Create `__tests__/unit/use-cases/chat/create-chat.use-case.test.ts` — mock `IChatRepository`; assert `create` is called and result is returned
- [x] 2.2 Create `__tests__/unit/use-cases/chat/delete-chat.use-case.test.ts` — mock `IChatRepository` + `IMessageRepository`; test happy path, `ChatNotFoundError`, and `UnauthorizedError`
- [x] 2.3 Create `__tests__/unit/use-cases/chat/rename-chat.use-case.test.ts` — mock `IChatRepository`; test happy path, `ChatNotFoundError`, and `UnauthorizedError`
- [x] 2.4 Create `__tests__/unit/use-cases/chat/pin-chat.use-case.test.ts` — mock `IChatRepository`; test happy path, `ChatNotFoundError`, and `UnauthorizedError`
- [x] 2.5 Create `__tests__/unit/use-cases/chat/list-chats.use-case.test.ts` — mock `IChatRepository`; assert `listByUser` is called and result is returned
- [x] 2.6 Create `__tests__/unit/use-cases/chat/search-chats.use-case.test.ts` — mock `IChatRepository`; assert `searchByTitle` is called and result is returned

## 3. Message Use Case Unit Tests

- [x] 3.1 Create `__tests__/unit/use-cases/message/list-messages.use-case.test.ts` — mock `IMessageRepository`; assert `findByChatId` is called and result is returned
- [x] 3.2 Create `__tests__/unit/use-cases/message/send-message.use-case.test.ts` — mock all three ports; test text event streaming and assistant message persistence, tool_result event propagation, `ChatNotFoundError`, and `UnauthorizedError`

## 4. Integration Tests

- [x] 4.1 Create `__tests__/integration/helpers/fake-auth.ts` — exports a fake BetterAuth adapter and a helper that builds a test-scoped Hono app via `createApp(container, fakeAuth)` with mock use cases injected into the container
- [x] 4.2 Create `__tests__/integration/trpc/chat.router.test.ts` — use `@hono/testing` to test `chat.create`, `chat.list`, `chat.delete` (happy path + NOT_FOUND), and unauthenticated access (UNAUTHORIZED)
- [x] 4.3 Create `__tests__/integration/trpc/message.router.test.ts` — use `@hono/testing` to test `message.list` happy path and unauthenticated access

## 5. Run & Verify

- [x] 5.1 Run `bun test` inside `apps/api` and confirm all tests pass with no type errors
