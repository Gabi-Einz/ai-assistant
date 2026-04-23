## 1. Input DTOs

- [x] 1.1 Create `apps/api/src/application/dtos/chat.dto.ts` exporting `CreateChatInput`, `ListChatsInput`, `SearchChatsInput`, `RenameChatInput`, `PinChatInput`, `DeleteChatInput` as plain TypeScript interfaces
- [x] 1.2 Create `apps/api/src/application/dtos/message.dto.ts` exporting `SendMessageInput` and `ListMessagesInput` as plain TypeScript interfaces

## 2. Chat Use Cases

- [x] 2.1 Create `apps/api/src/application/use-cases/chat/create-chat.use-case.ts` — constructor accepts `IChatRepository`; `execute(input: CreateChatInput): Promise<Chat>` calls `chatRepository.create()`
- [x] 2.2 Create `apps/api/src/application/use-cases/chat/list-chats.use-case.ts` — constructor accepts `IChatRepository`; `execute(input: ListChatsInput): Promise<Chat[]>` calls `chatRepository.listByUser()`
- [x] 2.3 Create `apps/api/src/application/use-cases/chat/search-chats.use-case.ts` — constructor accepts `IChatRepository`; `execute(input: SearchChatsInput): Promise<Chat[]>` calls `chatRepository.searchByTitle()`
- [x] 2.4 Create `apps/api/src/application/use-cases/chat/rename-chat.use-case.ts` — constructor accepts `IChatRepository`; `execute(input: RenameChatInput): Promise<void>` does findById → ownership check → rename
- [x] 2.5 Create `apps/api/src/application/use-cases/chat/pin-chat.use-case.ts` — constructor accepts `IChatRepository`; `execute(input: PinChatInput): Promise<void>` does findById → ownership check → togglePin
- [x] 2.6 Create `apps/api/src/application/use-cases/chat/delete-chat.use-case.ts` — constructor accepts `IChatRepository` and `IMessageRepository`; `execute(input: DeleteChatInput): Promise<void>` does findById → ownership check → deleteByChatId → delete

## 3. Message Use Cases

- [x] 3.1 Create `apps/api/src/application/use-cases/message/send-message.use-case.ts` — constructor accepts `IChatRepository`, `IMessageRepository`, `IAIProvider`; `execute(input: SendMessageInput): AsyncIterable<StreamEvent>` is an async generator: ownership check → save user message → fetch history → stream AI → yield events → save assistant message
- [x] 3.2 Create `apps/api/src/application/use-cases/message/list-messages.use-case.ts` — constructor accepts `IChatRepository` and `IMessageRepository`; `execute(input: ListMessagesInput): Promise<Message[]>` does findById → ownership check → findByChatId

## 4. Barrel Exports & Type Check

- [x] 4.1 Create `apps/api/src/application/dtos/index.ts` re-exporting all DTO interfaces
- [x] 4.2 Run `pnpm --filter api tsc --noEmit` from the project root and confirm zero type errors
