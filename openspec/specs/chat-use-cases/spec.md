## ADDED Requirements

### Requirement: Chat use case input DTOs are plain TypeScript interfaces
`apps/api/src/application/dtos/chat.dto.ts` SHALL export the following interfaces with no imports and no runtime code: `CreateChatInput`, `ListChatsInput`, `SearchChatsInput`, `RenameChatInput`, `PinChatInput`, and `DeleteChatInput`. Each interface SHALL define only the fields required by its corresponding use case.

#### Scenario: CreateChatInput has userId and title
- **WHEN** a value is typed as `CreateChatInput`
- **THEN** TypeScript enforces `userId: string` and `title: string`

#### Scenario: ListChatsInput supports cursor-based pagination
- **WHEN** a value is typed as `ListChatsInput`
- **THEN** TypeScript enforces `userId: string`, `cursor: string | null`, and `limit: number`

#### Scenario: Mutation input DTOs include chatId and userId for ownership checks
- **WHEN** a value is typed as `RenameChatInput`, `PinChatInput`, or `DeleteChatInput`
- **THEN** TypeScript enforces the presence of both `chatId: string` and `userId: string`

### Requirement: CreateChatUseCase creates a chat and returns it
`apps/api/src/application/use-cases/chat/create-chat.use-case.ts` SHALL export `CreateChatUseCase`. Its constructor SHALL accept `IChatRepository`. Its `execute(input: CreateChatInput): Promise<Chat>` method SHALL call `IChatRepository.create(input.userId, input.title)` and return the resulting `Chat`.

#### Scenario: CreateChatUseCase delegates creation to the repository
- **WHEN** `execute({ userId: 'u1', title: 'My Chat' })` is called
- **THEN** `IChatRepository.create('u1', 'My Chat')` is called once and the returned `Chat` is returned by `execute`

### Requirement: ListChatsUseCase returns paginated chats for a user
`apps/api/src/application/use-cases/chat/list-chats.use-case.ts` SHALL export `ListChatsUseCase`. Its constructor SHALL accept `IChatRepository`. Its `execute(input: ListChatsInput): Promise<Chat[]>` method SHALL call `IChatRepository.listByUser(input.userId, input.cursor, input.limit)` and return the result.

#### Scenario: ListChatsUseCase passes cursor and limit to repository
- **WHEN** `execute({ userId: 'u1', cursor: null, limit: 20 })` is called
- **THEN** `IChatRepository.listByUser('u1', null, 20)` is called and its result is returned

### Requirement: SearchChatsUseCase returns chats matching a title query
`apps/api/src/application/use-cases/chat/search-chats.use-case.ts` SHALL export `SearchChatsUseCase`. Its constructor SHALL accept `IChatRepository`. Its `execute(input: SearchChatsInput): Promise<Chat[]>` method SHALL call `IChatRepository.searchByTitle(input.userId, input.query)` and return the result.

#### Scenario: SearchChatsUseCase delegates to repository text search
- **WHEN** `execute({ userId: 'u1', query: 'AI' })` is called
- **THEN** `IChatRepository.searchByTitle('u1', 'AI')` is called and its result is returned

### Requirement: RenameChatUseCase enforces ownership before renaming
`apps/api/src/application/use-cases/chat/rename-chat.use-case.ts` SHALL export `RenameChatUseCase`. Its constructor SHALL accept `IChatRepository`. Its `execute(input: RenameChatInput): Promise<void>` method SHALL: call `IChatRepository.findById(input.chatId)`, throw `ChatNotFoundError` if null, throw `UnauthorizedError` if `chat.userId !== input.userId`, then call `IChatRepository.rename(input.chatId, input.title)`.

#### Scenario: RenameChatUseCase throws ChatNotFoundError when chat does not exist
- **WHEN** `IChatRepository.findById` returns `null`
- **THEN** `execute` throws `ChatNotFoundError`

#### Scenario: RenameChatUseCase throws UnauthorizedError when user does not own chat
- **WHEN** `IChatRepository.findById` returns a chat with `userId: 'other'` and `input.userId` is `'u1'`
- **THEN** `execute` throws `UnauthorizedError`

#### Scenario: RenameChatUseCase calls rename after successful ownership check
- **WHEN** `IChatRepository.findById` returns a chat owned by `input.userId`
- **THEN** `IChatRepository.rename(input.chatId, input.title)` is called once

### Requirement: PinChatUseCase enforces ownership before toggling pin
`apps/api/src/application/use-cases/chat/pin-chat.use-case.ts` SHALL export `PinChatUseCase`. Its constructor SHALL accept `IChatRepository`. Its `execute(input: PinChatInput): Promise<void>` method SHALL: call `IChatRepository.findById(input.chatId)`, throw `ChatNotFoundError` if null, throw `UnauthorizedError` if `chat.userId !== input.userId`, then call `IChatRepository.togglePin(input.chatId)`.

#### Scenario: PinChatUseCase throws UnauthorizedError for non-owner
- **WHEN** the chat exists but `chat.userId !== input.userId`
- **THEN** `execute` throws `UnauthorizedError` and `IChatRepository.togglePin` is NOT called

#### Scenario: PinChatUseCase calls togglePin after successful ownership check
- **WHEN** the chat exists and `chat.userId === input.userId`
- **THEN** `IChatRepository.togglePin(input.chatId)` is called once

### Requirement: DeleteChatUseCase enforces ownership and cascades message deletion
`apps/api/src/application/use-cases/chat/delete-chat.use-case.ts` SHALL export `DeleteChatUseCase`. Its constructor SHALL accept `IChatRepository` and `IMessageRepository`. Its `execute(input: DeleteChatInput): Promise<void>` method SHALL: call `IChatRepository.findById(input.chatId)`, throw `ChatNotFoundError` if null, throw `UnauthorizedError` if `chat.userId !== input.userId`, then call `IMessageRepository.deleteByChatId(input.chatId)`, then call `IChatRepository.delete(input.chatId)`.

#### Scenario: DeleteChatUseCase deletes messages before deleting the chat
- **WHEN** the chat exists and `chat.userId === input.userId`
- **THEN** `IMessageRepository.deleteByChatId` is called before `IChatRepository.delete`

#### Scenario: DeleteChatUseCase throws ChatNotFoundError when chat does not exist
- **WHEN** `IChatRepository.findById` returns `null`
- **THEN** `execute` throws `ChatNotFoundError` and neither delete method is called
