## ADDED Requirements

### Requirement: Message use case input DTOs are plain TypeScript interfaces
`apps/api/src/application/dtos/message.dto.ts` SHALL export `SendMessageInput` and `ListMessagesInput` as TypeScript interfaces with no imports and no runtime code.

#### Scenario: SendMessageInput has chatId, userId, and content
- **WHEN** a value is typed as `SendMessageInput`
- **THEN** TypeScript enforces `chatId: string`, `userId: string`, and `content: string`

#### Scenario: ListMessagesInput has chatId and userId
- **WHEN** a value is typed as `ListMessagesInput`
- **THEN** TypeScript enforces `chatId: string` and `userId: string`

### Requirement: SendMessageUseCase orchestrates user message persistence, AI streaming, and assistant message persistence
`apps/api/src/application/use-cases/message/send-message.use-case.ts` SHALL export `SendMessageUseCase`. Its constructor SHALL accept `IChatRepository`, `IMessageRepository`, and `IAIProvider`. Its `execute(input: SendMessageInput): AsyncIterable<StreamEvent>` SHALL be an async generator that:
1. Calls `IChatRepository.findById(input.chatId)`, throws `ChatNotFoundError` if null, throws `UnauthorizedError` if `chat.userId !== input.userId`
2. Calls `IMessageRepository.save()` with a user `Message` (`role: 'user'`, `content: input.content`, `toolResults: []`)
3. Retrieves message history via `IMessageRepository.findByChatId(input.chatId)`
4. Calls `IAIProvider.stream(history, [])` and yields each `StreamEvent` to the caller
5. After the stream ends, assembles the assistant message by accumulating text deltas and tool results from the yielded events, then calls `IMessageRepository.save()` with the assistant `Message` (`role: 'assistant'`)

#### Scenario: SendMessageUseCase throws ChatNotFoundError when chat does not exist
- **WHEN** `IChatRepository.findById` returns `null`
- **THEN** the async generator throws `ChatNotFoundError` before yielding any events

#### Scenario: SendMessageUseCase throws UnauthorizedError when user does not own chat
- **WHEN** `IChatRepository.findById` returns a chat with a different `userId`
- **THEN** the async generator throws `UnauthorizedError` before yielding any events

#### Scenario: SendMessageUseCase saves user message before streaming
- **WHEN** `execute` is iterated and the ownership check passes
- **THEN** `IMessageRepository.save` is called with `role: 'user'` before the first `StreamEvent` is yielded

#### Scenario: SendMessageUseCase yields all StreamEvents from IAIProvider
- **WHEN** `IAIProvider.stream` yields three `StreamEvent` values
- **THEN** `execute` yields the same three `StreamEvent` values in the same order

#### Scenario: SendMessageUseCase saves assistant message after stream ends
- **WHEN** the stream from `IAIProvider.stream` is exhausted
- **THEN** `IMessageRepository.save` is called a second time with `role: 'assistant'`, the concatenated text content, and any tool results collected during streaming

### Requirement: ListMessagesUseCase returns all messages for a chat in chronological order
`apps/api/src/application/use-cases/message/list-messages.use-case.ts` SHALL export `ListMessagesUseCase`. Its constructor SHALL accept `IChatRepository` and `IMessageRepository`. Its `execute(input: ListMessagesInput): Promise<Message[]>` method SHALL: call `IChatRepository.findById(input.chatId)`, throw `ChatNotFoundError` if null, throw `UnauthorizedError` if `chat.userId !== input.userId`, then call and return `IMessageRepository.findByChatId(input.chatId)`.

#### Scenario: ListMessagesUseCase throws ChatNotFoundError when chat does not exist
- **WHEN** `IChatRepository.findById` returns `null`
- **THEN** `execute` throws `ChatNotFoundError`

#### Scenario: ListMessagesUseCase throws UnauthorizedError when user does not own chat
- **WHEN** the chat exists but `chat.userId !== input.userId`
- **THEN** `execute` throws `UnauthorizedError` and `IMessageRepository.findByChatId` is NOT called

#### Scenario: ListMessagesUseCase returns messages from repository
- **WHEN** the chat exists and `chat.userId === input.userId`
- **THEN** `IMessageRepository.findByChatId(input.chatId)` is called and its result is returned
