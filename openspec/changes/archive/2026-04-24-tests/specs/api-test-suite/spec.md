## ADDED Requirements

### Requirement: CreateChatUseCase is unit-tested
The suite SHALL test `CreateChatUseCase` using a mock `IChatRepository`.

#### Scenario: Creates a chat and returns it
- **WHEN** `execute` is called with a valid `userId` and `title`
- **THEN** `chatRepository.create` is called with those values and the result is returned

### Requirement: DeleteChatUseCase is unit-tested
The suite SHALL test `DeleteChatUseCase` with mocks for `IChatRepository` and `IMessageRepository`.

#### Scenario: Deletes chat and its messages when owner requests it
- **WHEN** `execute` is called and `findById` returns a chat owned by `userId`
- **THEN** `messageRepository.deleteByChatId` is called followed by `chatRepository.delete`

#### Scenario: Throws ChatNotFoundError when chat does not exist
- **WHEN** `execute` is called and `findById` returns null
- **THEN** a `ChatNotFoundError` is thrown

#### Scenario: Throws UnauthorizedError when requester is not the owner
- **WHEN** `execute` is called and the chat's `userId` does not match the input `userId`
- **THEN** an `UnauthorizedError` is thrown

### Requirement: RenameChatUseCase is unit-tested
The suite SHALL test `RenameChatUseCase` with a mock `IChatRepository`.

#### Scenario: Renames chat when owner requests it
- **WHEN** `execute` is called with a valid `chatId`, matching `userId`, and new `title`
- **THEN** `chatRepository.rename` is called with those values

#### Scenario: Throws ChatNotFoundError when chat does not exist
- **WHEN** `execute` is called and `findById` returns null
- **THEN** a `ChatNotFoundError` is thrown

#### Scenario: Throws UnauthorizedError when requester is not the owner
- **WHEN** `execute` is called and the chat's `userId` does not match
- **THEN** an `UnauthorizedError` is thrown

### Requirement: PinChatUseCase is unit-tested
The suite SHALL test `PinChatUseCase` with a mock `IChatRepository`.

#### Scenario: Toggles pin when owner requests it
- **WHEN** `execute` is called with a valid `chatId` and matching `userId`
- **THEN** `chatRepository.togglePin` is called with the `chatId`

#### Scenario: Throws ChatNotFoundError when chat does not exist
- **WHEN** `execute` is called and `findById` returns null
- **THEN** a `ChatNotFoundError` is thrown

#### Scenario: Throws UnauthorizedError when requester is not the owner
- **WHEN** `execute` is called and the chat's `userId` does not match
- **THEN** an `UnauthorizedError` is thrown

### Requirement: ListChatsUseCase is unit-tested
The suite SHALL test `ListChatsUseCase` with a mock `IChatRepository`.

#### Scenario: Returns chats for the user
- **WHEN** `execute` is called with a valid `userId`, `cursor`, and `limit`
- **THEN** `chatRepository.listByUser` is called and its result is returned

### Requirement: SearchChatsUseCase is unit-tested
The suite SHALL test `SearchChatsUseCase` with a mock `IChatRepository`.

#### Scenario: Returns matching chats
- **WHEN** `execute` is called with a valid `userId` and `query`
- **THEN** `chatRepository.searchByTitle` is called and its result is returned

### Requirement: ListMessagesUseCase is unit-tested
The suite SHALL test `ListMessagesUseCase` with a mock `IMessageRepository`.

#### Scenario: Returns messages for the chat
- **WHEN** `execute` is called with a valid `chatId` and `userId`
- **THEN** `messageRepository.findByChatId` is called and its result is returned

### Requirement: SendMessageUseCase is unit-tested
The suite SHALL test `SendMessageUseCase` with mocks for `IChatRepository`, `IMessageRepository`, and `IAIProvider`.

#### Scenario: Yields text events and saves assistant message
- **WHEN** `execute` is called and the AI provider yields text events
- **THEN** all text events are yielded to the caller and the assistant message is saved with the accumulated content

#### Scenario: Yields tool_result events and saves them on the message
- **WHEN** the AI provider yields a tool_result event
- **THEN** the event is yielded and the assistant message is saved with the tool result in `toolResults`

#### Scenario: Throws ChatNotFoundError when chat does not exist
- **WHEN** `execute` is called and `chatRepository.findById` returns null
- **THEN** a `ChatNotFoundError` is thrown before any message is saved

#### Scenario: Throws UnauthorizedError when requester is not the owner
- **WHEN** `execute` is called and the chat's `userId` does not match the input `userId`
- **THEN** an `UnauthorizedError` is thrown before any message is saved

### Requirement: tRPC chat procedures are integration-tested
The suite SHALL test tRPC chat procedures through the real Hono app using `@hono/testing`.

#### Scenario: chat.create returns the created chat
- **WHEN** an authenticated request calls `chat.create` with a valid title
- **THEN** the response contains the new chat object with the expected title

#### Scenario: chat.list returns a paginated list
- **WHEN** an authenticated request calls `chat.list`
- **THEN** the response contains an array of chats

#### Scenario: chat.delete returns success
- **WHEN** an authenticated request calls `chat.delete` with an existing chatId
- **THEN** the response contains `{ success: true }`

#### Scenario: chat.delete returns NOT_FOUND for unknown chatId
- **WHEN** an authenticated request calls `chat.delete` with a non-existent chatId
- **THEN** the tRPC response error code is `NOT_FOUND`

#### Scenario: Unauthenticated request returns UNAUTHORIZED
- **WHEN** a request without a valid session calls any authed procedure
- **THEN** the tRPC response error code is `UNAUTHORIZED`

### Requirement: tRPC message procedures are integration-tested
The suite SHALL test tRPC message procedures through the real Hono app using `@hono/testing`.

#### Scenario: message.list returns messages for a chat
- **WHEN** an authenticated request calls `message.list` with a valid chatId
- **THEN** the response contains an array of messages
