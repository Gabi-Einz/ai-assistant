## ADDED Requirements

### Requirement: chat.create creates a new chat for the authenticated user
`chat.router.ts` SHALL export a `chatRouter` with a `create` mutation. Input: `z.object({ title: z.string().min(1).max(100) })`. It SHALL call `ctx.createChat.execute({ userId: ctx.userId, title: input.title })` and return the resulting `Chat`.

#### Scenario: Authenticated user creates a chat
- **WHEN** `chat.create` is called with `{ title: "My Chat" }` and a valid session
- **THEN** a new chat document is persisted and returned with `_id`, `userId`, `title`, `isPinned: false`, `createdAt`, `updatedAt`

### Requirement: chat.list returns paginated chats sorted by pinned-first then updatedAt
`chat.router.ts` SHALL export a `list` query. Input: `z.object({ cursor: z.string().optional(), limit: z.number().int().min(1).max(50).default(20) })`. It SHALL call `ctx.listChats.execute({ userId: ctx.userId, cursor: input.cursor, limit: input.limit })` and return `Chat[]`.

#### Scenario: list returns chats for the authenticated user
- **WHEN** `chat.list` is called with no cursor
- **THEN** it returns up to 20 chats sorted pinned-first, then by `updatedAt` descending

### Requirement: chat.search returns chats matching a title query
`chat.router.ts` SHALL export a `search` query. Input: `z.object({ query: z.string().min(1) })`. It SHALL call `ctx.searchChats.execute({ userId: ctx.userId, query: input.query })` and return `Chat[]`.

#### Scenario: search returns matching chats
- **WHEN** `chat.search` is called with `{ query: "work" }`
- **THEN** it returns chats whose title matches "work" via MongoDB text index, scoped to the authenticated user

### Requirement: chat.rename updates the title of a chat owned by the user
`chat.router.ts` SHALL export a `rename` mutation. Input: `z.object({ chatId: z.string(), title: z.string().min(1).max(100) })`. It SHALL call `ctx.renameChat.execute({ chatId: input.chatId, userId: ctx.userId, title: input.title })`.

#### Scenario: rename succeeds for chat owner
- **WHEN** `chat.rename` is called with a valid `chatId` owned by the user
- **THEN** the chat title is updated and the procedure returns `{ success: true }`

#### Scenario: rename throws NOT_FOUND for unknown chatId
- **WHEN** `chat.rename` is called with a `chatId` that does not exist
- **THEN** tRPC returns an error with code `NOT_FOUND`

#### Scenario: rename throws FORBIDDEN for chat not owned by user
- **WHEN** `chat.rename` is called with a `chatId` owned by a different user
- **THEN** tRPC returns an error with code `FORBIDDEN`

### Requirement: chat.togglePin toggles the isPinned flag of a chat
`chat.router.ts` SHALL export a `togglePin` mutation. Input: `z.object({ chatId: z.string() })`. It SHALL call `ctx.pinChat.execute({ chatId: input.chatId, userId: ctx.userId })`.

#### Scenario: togglePin flips isPinned for chat owner
- **WHEN** `chat.togglePin` is called with a valid `chatId`
- **THEN** `isPinned` is atomically toggled and the procedure returns `{ success: true }`

### Requirement: chat.delete removes a chat and all its messages
`chat.router.ts` SHALL export a `delete` mutation. Input: `z.object({ chatId: z.string() })`. It SHALL call `ctx.deleteChat.execute({ chatId: input.chatId, userId: ctx.userId })`.

#### Scenario: delete removes chat and messages for owner
- **WHEN** `chat.delete` is called with a valid `chatId`
- **THEN** the chat document and all associated message documents are deleted

### Requirement: All chat procedures are behind authedProcedure
All 6 procedures in `chatRouter` SHALL use `authedProcedure`, not the base `t.procedure`.

#### Scenario: Unauthenticated request to any chat procedure fails
- **WHEN** any `chat.*` procedure is called without a valid session
- **THEN** tRPC returns an `UNAUTHORIZED` error
