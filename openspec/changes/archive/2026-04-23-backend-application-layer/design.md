## Context

The domain layer (step 3) provides the port interfaces and entity types. This step builds the application layer on top: eight use cases that implement the business workflows by calling those ports, and two DTO files that define use case input shapes. This is the last purely framework-free layer before infrastructure concerns enter.

All files live in `apps/api/src/application/`. The only permitted imports are: domain entities and ports (`../domain/`), shared types (`@repo/shared`), and standard TypeScript/JavaScript built-ins.

## Goals / Non-Goals

**Goals:**
- Implement all eight use cases with constructor injection typed to port interfaces
- Enforce chat ownership at the use case level (not in repositories or HTTP handlers)
- Define plain TypeScript input DTO interfaces for every use case
- Ensure `SendMessageUseCase` correctly sequences: persist user message → stream AI → persist assistant message on completion
- Zero framework imports in this layer

**Non-Goals:**
- Implementing the ports (infrastructure concern, step 5)
- Validating inputs with Zod (tRPC boundary concern, step 7)
- Handling HTTP errors, status codes, or response serialization
- Defining output DTOs for the wire — `ChatDto` and `MessageDto` are already in `@repo/shared` and are used by the tRPC routers

## Decisions

**Use cases as classes with a single `execute()` method**
Each use case is a class whose constructor accepts the port interfaces it needs. `execute()` is the only public method. This pattern makes dependencies explicit at construction time (TypeScript enforces all ports are provided), and it is what the composition root (`container.ts`) will instantiate in step 6. Alternatives considered: plain functions with closure-captured ports (less discoverable), or a command-bus pattern (unnecessary abstraction for eight use cases).

**Input DTOs are plain TypeScript interfaces, not classes**
`CreateChatInput`, `SendMessageInput`, etc. are `interface` declarations in `chat.dto.ts` / `message.dto.ts`. They carry no validation logic — that belongs at the tRPC Zod boundary. Having these interfaces centralises what each use case expects and makes the tRPC procedures' `input` Zod schemas easy to align.

**Ownership enforcement lives in the use case, not the repository**
When a mutation use case (rename, pin, delete, send message, list messages) is invoked, it calls `IChatRepository.findById()` first, then compares `chat.userId === input.userId`. If the check fails, it throws `UnauthorizedError`. This keeps authorization logic testable with pure mock ports, independent of any HTTP middleware.

**`SendMessageUseCase.execute()` is an async generator**
The method is declared `async *execute(input)` and yields `StreamEvent` values as they arrive from `IAIProvider.stream()`. It is responsible for:
1. Finding the chat (ownership check)
2. Saving the user `Message` via `IMessageRepository.save()`
3. Iterating `IAIProvider.stream()` and yielding each `StreamEvent`
4. After the stream ends, accumulating the assistant text and tool results, then saving the assistant `Message` via `IMessageRepository.save()`

The tRPC streaming procedure (step 7) will consume this `AsyncIterable<StreamEvent>` directly.

**`DeleteChatUseCase` cascades message deletion via `IMessageRepository.deleteByChatId()`**
The use case calls `IMessageRepository.deleteByChatId()` explicitly before deleting the chat. This keeps cascade semantics in the application layer where they are testable, rather than relying on a database trigger or repository side-effect.

**`ListChatsUseCase` delegates sort ordering to the repository**
The `IChatRepository.listByUser()` contract (pinned first, then `updatedAt` desc) is an invariant owned by the repository implementation. The use case trusts the returned order and does not re-sort.

## Risks / Trade-offs

**[Risk] `SendMessageUseCase` accumulates full assistant response in memory before persisting** → Mitigation: For this project's scale this is acceptable. The assistant message is built by concatenating text deltas; tool results are collected in a `ToolResult[]` array. Both are bounded by a single streaming response.

**[Risk] Ownership check requires an extra `findById` round-trip for every mutation** → Mitigation: The extra read is negligible at this scale and is the correct pattern for hexagonal architecture. Skipping it would push auth logic into the repository or middleware, which would make it harder to test.

**[Risk] Input DTOs might diverge from tRPC Zod schema shapes over time** → Mitigation: tRPC procedures will define Zod schemas whose inferred types match the DTO interfaces via TypeScript's structural typing. If they diverge, the TypeScript compiler will report an error at the procedure call site.
