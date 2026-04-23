## Why

With the domain layer (entities, port interfaces, domain errors) in place, the application layer can now be built: the use cases that orchestrate domain logic by injecting and calling port interfaces. Without this layer, there is no business logic to expose via tRPC, and no point in wiring up infrastructure adapters.

## What Changes

- `apps/api/src/application/dtos/chat.dto.ts` — input command/query types for all chat use cases
- `apps/api/src/application/dtos/message.dto.ts` — input command/query types for message use cases
- `apps/api/src/application/use-cases/chat/create-chat.use-case.ts` — creates a new chat for a user
- `apps/api/src/application/use-cases/chat/list-chats.use-case.ts` — lists chats (cursor-based, pinned first) for a user
- `apps/api/src/application/use-cases/chat/search-chats.use-case.ts` — full-text search over chat titles for a user
- `apps/api/src/application/use-cases/chat/rename-chat.use-case.ts` — renames a chat, enforcing ownership
- `apps/api/src/application/use-cases/chat/pin-chat.use-case.ts` — toggles pin on a chat, enforcing ownership
- `apps/api/src/application/use-cases/chat/delete-chat.use-case.ts` — deletes a chat and all its messages, enforcing ownership
- `apps/api/src/application/use-cases/message/send-message.use-case.ts` — persists the user message, streams the AI response, persists the assistant message on completion; yields `AsyncIterable<StreamEvent>`
- `apps/api/src/application/use-cases/message/list-messages.use-case.ts` — retrieves all messages for a chat, enforcing ownership

## Capabilities

### New Capabilities
- `chat-use-cases`: The six chat use cases (create, list, search, rename, pin, delete) and their input DTO types
- `message-use-cases`: The two message use cases (send, list) and their input DTO types

### Modified Capabilities

## Impact

- All files land in `apps/api/src/application/` — no other directories touched
- Depends on `apps/api/src/domain/` (step 3): port interfaces and domain error classes
- Depends on `@repo/shared`: `StreamEvent`, `Chat`, `Message`, `ToolResult` types
- Infrastructure adapters (step 5) and tRPC routers (step 7) will consume these use cases
- `SendMessageUseCase` is the only use case with a streaming return type — all others return plain `Promise<T>`
- No framework imports permitted in this layer; dependencies are injected via constructor
