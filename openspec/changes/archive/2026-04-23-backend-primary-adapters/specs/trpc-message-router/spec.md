## ADDED Requirements

### Requirement: message.list returns all messages for a chat in chronological order
`message.router.ts` SHALL export a `messageRouter` with a `list` query. Input: `z.object({ chatId: z.string() })`. It SHALL call `ctx.listMessages.execute({ chatId: input.chatId, userId: ctx.userId })` and return `Message[]` sorted by `createdAt` ascending.

#### Scenario: list returns messages for the chat owner
- **WHEN** `message.list` is called with a `chatId` owned by the authenticated user
- **THEN** all messages for that chat are returned, sorted oldest-first

#### Scenario: list throws NOT_FOUND for unknown chatId
- **WHEN** `message.list` is called with a `chatId` that does not exist
- **THEN** tRPC returns an error with code `NOT_FOUND`

#### Scenario: list throws FORBIDDEN for chat not owned by user
- **WHEN** `message.list` is called with a `chatId` owned by a different user
- **THEN** tRPC returns an error with code `FORBIDDEN`

### Requirement: message.list is behind authedProcedure
The `list` procedure in `messageRouter` SHALL use `authedProcedure`.

#### Scenario: Unauthenticated request to message.list fails
- **WHEN** `message.list` is called without a valid session
- **THEN** tRPC returns an `UNAUTHORIZED` error

### Requirement: message.router.ts does not define a send procedure
The `sendMessage` streaming flow is implemented in step 8 as a dedicated SSE endpoint. `message.router.ts` SHALL NOT define a `send` procedure in this step.

#### Scenario: messageRouter only exports a list procedure
- **WHEN** the `messageRouter` is inspected
- **THEN** it contains exactly one procedure: `list`
