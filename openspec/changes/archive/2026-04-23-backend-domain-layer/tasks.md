## 1. Entity Interfaces

- [x] 1.1 Create `apps/api/src/domain/entities/chat.entity.ts` exporting `Chat` interface (`_id`, `userId`, `title`, `isPinned`, `createdAt`, `updatedAt`)
- [x] 1.2 Create `apps/api/src/domain/entities/message.entity.ts` exporting `Message` interface (`_id`, `chatId`, `userId`, `role: MessageRole`, `content`, `toolResults: ToolResult[]`, `createdAt`) importing `MessageRole` and `ToolResult` from `@repo/shared`

## 2. Port Interfaces

- [x] 2.1 Create `apps/api/src/domain/ports/chat-repository.port.ts` exporting `IChatRepository` with methods: `create`, `findById`, `listByUser`, `searchByTitle`, `rename`, `togglePin`, `delete`
- [x] 2.2 Create `apps/api/src/domain/ports/message-repository.port.ts` exporting `IMessageRepository` with methods: `save`, `findByChatId`, `deleteByChatId`
- [x] 2.3 Create `apps/api/src/domain/ports/ai-provider.port.ts` exporting `IAIProvider` with `stream(history: Message[], tools: unknown[]): AsyncIterable<StreamEvent>` — import `StreamEvent` from `@repo/shared`
- [x] 2.4 Create `apps/api/src/domain/ports/datetime-provider.port.ts` exporting `IDateTimeProvider` with `getCurrentDate(): string` and `getCurrentTime(): string` — no imports
- [x] 2.5 Create `apps/api/src/domain/ports/weather-provider.port.ts` exporting `IWeatherProvider` with `getWeather(location: string): Promise<GetWeatherPayload>` — import `GetWeatherPayload` from `@repo/shared`

## 3. Domain Errors

- [x] 3.1 Create `apps/api/src/domain/errors/chat-not-found.error.ts` exporting `ChatNotFoundError extends Error` with constructor `(chatId: string)`, sets `this.name = 'ChatNotFoundError'`
- [x] 3.2 Create `apps/api/src/domain/errors/unauthorized.error.ts` exporting `UnauthorizedError extends Error` with optional `message` parameter defaulting to `'Unauthorized'`, sets `this.name = 'UnauthorizedError'`

## 4. Barrel Exports & Type Check

- [x] 4.1 Create `apps/api/src/domain/entities/index.ts` re-exporting `Chat` and `Message`
- [x] 4.2 Create `apps/api/src/domain/ports/index.ts` re-exporting all five port interfaces
- [x] 4.3 Create `apps/api/src/domain/errors/index.ts` re-exporting `ChatNotFoundError` and `UnauthorizedError`
- [x] 4.4 Run `pnpm --filter api tsc --noEmit` and confirm zero type errors across all domain files
