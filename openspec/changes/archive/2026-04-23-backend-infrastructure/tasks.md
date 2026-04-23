## 1. Dependencies

- [x] 1.1 Add `mongodb` to `apps/api/package.json` dependencies
- [x] 1.2 Add `ai` and `@ai-sdk/anthropic` to `apps/api/package.json` dependencies
- [x] 1.3 Run `pnpm install` from the project root

## 2. MongoDB Connection

- [x] 2.1 Create `apps/api/src/infrastructure/db/mongo.ts` exporting `connectDb(): Promise<Db>` — creates `MongoClient` from `MONGODB_URI`, pings server, creates indexes (`chats: { userId, updatedAt }`, `chats: { title: 'text' }`, `messages: { chatId, createdAt }`), returns `Db` handle

## 3. MongoDB Repositories

- [x] 3.1 Create `apps/api/src/infrastructure/repositories/mongo-chat.repository.ts` exporting `MongoChatRepository implements IChatRepository` — define `ChatDocument` type with `ObjectId _id`; implement all 7 methods with ObjectId↔string conversion; `listByUser` sorts `{ isPinned: -1, updatedAt: -1 }` with `_id < cursor` pagination; `searchByTitle` uses `$text`; `rename` sets `updatedAt`; `togglePin` uses `$set` with negated current value
- [x] 3.2 Create `apps/api/src/infrastructure/repositories/mongo-message.repository.ts` exporting `MongoMessageRepository implements IMessageRepository` — define `MessageDocument` type; implement `save` (insert + return with string `_id`), `findByChatId` (sorted `{ createdAt: 1 }`), `deleteByChatId` (`deleteMany`)

## 4. Secondary Providers

- [x] 4.1 Create `apps/api/src/infrastructure/ai/ai-sdk.provider.ts` exporting `AiSdkProvider implements IAIProvider` — constructor accepts `LanguageModel` and tools object; `stream()` is async generator calling `streamText({ model, messages, tools })` iterating `fullStream`; maps `text-delta` → `{ type: 'text', delta }`; maps `tool-result` → `{ type: 'tool_result', toolName, payload: { toolName, payload: result } }`; skips other chunk types; converts `Message[]` history to AI SDK `CoreMessage[]` format
- [x] 4.2 Create `apps/api/src/infrastructure/providers/datetime.provider.ts` exporting `DateTimeProvider implements IDateTimeProvider` — `getCurrentDate()` returns `new Date().toISOString().split('T')[0]`; `getCurrentTime()` returns zero-padded `HH:MM:SS` from `new Date()`
- [x] 4.3 Create `apps/api/src/infrastructure/providers/weather.provider.ts` exporting `WeatherProvider implements IWeatherProvider` — constructor accepts `apiKey: string`; `getWeather(location)` fetches OpenWeatherMap `data/2.5/weather?q={location}&appid={apiKey}&units=metric`; throws on non-ok response; maps to `GetWeatherPayload`

## 5. Tool Adapters

- [x] 5.1 Create `apps/api/src/infrastructure/tools/get-date.tool.ts` exporting `buildGetDateTool(dateTimeProvider)` — returns AI SDK `tool({ description, parameters: z.object({}), execute: async () => ({ date: dateTimeProvider.getCurrentDate() }) })`
- [x] 5.2 Create `apps/api/src/infrastructure/tools/get-time.tool.ts` exporting `buildGetTimeTool(dateTimeProvider)` — returns AI SDK `tool({ description, parameters: z.object({}), execute: async () => ({ time: dateTimeProvider.getCurrentTime() }) })`
- [x] 5.3 Create `apps/api/src/infrastructure/tools/get-weather.tool.ts` exporting `buildGetWeatherTool(weatherProvider)` — returns AI SDK `tool({ description, parameters: z.object({ location: z.string() }), execute: async ({ location }) => weatherProvider.getWeather(location) })`
- [x] 5.4 Create `apps/api/src/infrastructure/tools/index.ts` exporting `buildTools({ dateTimeProvider, weatherProvider })` — returns `{ get_date: buildGetDateTool(...), get_time: buildGetTimeTool(...), get_weather: buildGetWeatherTool(...) }`

## 6. Type Check

- [x] 6.1 Run `cd apps/api && pnpm exec tsc --noEmit` and confirm zero type errors across all infrastructure files
