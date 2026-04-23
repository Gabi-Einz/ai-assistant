## Context

Domain and application layers are complete. This step implements all secondary adapters in `apps/api/src/infrastructure/`. The composition root (`container.ts`, step 6) will import everything built here; no wiring happens in this step. The runtime is Bun, so native `fetch` and `AsyncIterable` are available without polyfills.

Env vars consumed: `MONGODB_URI`, `AI_API_KEY`, `WEATHER_API_KEY`.

## Goals / Non-Goals

**Goals:**
- Implement `MongoChatRepository` and `MongoMessageRepository` satisfying their port contracts
- Implement `AiSdkProvider` mapping AI SDK streaming output to `StreamEvent` values
- Implement `DateTimeProvider` and `WeatherProvider` for tool execution
- Define three AI SDK tool modules and a `buildTools` factory
- Create `mongo.ts` that connects to MongoDB and creates all required indexes at startup

**Non-Goals:**
- Wiring adapters together in a DI container (step 6)
- Mounting Hono routes or tRPC routers (step 7)
- BetterAuth adapter (step 7)
- Environment variable validation with Zod (step 9)

## Decisions

**MongoDB native driver with typed `Collection<TDocument>`**
No ORM is used per requirements. Each repository receives a `Db` handle in its constructor and calls `db.collection<TDocument>(name)` to get a strongly-typed collection. The document type (e.g., `ChatDocument`) is an internal infrastructure type that mirrors the domain entity but uses `ObjectId` for `_id`.

**ObjectId ↔ string conversion at the repository boundary**
Domain entities use `_id: string`. MongoDB stores `ObjectId`. Each repository converts outbound: `doc._id.toHexString()` → `string`. Inbound: `new ObjectId(id)` before querying. This keeps the domain completely free of the MongoDB driver.

**`ChatDocument` and `MessageDocument` as internal infra types**
Repositories define local document interfaces (`interface ChatDocument { _id: ObjectId; ... }`) to type their `Collection<T>`. These types never cross the repository boundary — callers receive plain `Chat` / `Message` domain objects.

**Index creation in `mongo.ts` at startup**
`mongo.ts` exports an `async connectDb()` function that creates the MongoDB client, pings the server, then calls `createIndex()` for all required indexes. Using `createIndex` (idempotent) rather than `ensureIndex` or checking existence manually. Indexes created:
- `chats`: `{ userId: 1, updatedAt: -1 }` — for `listByUser` (sorted, paginated)
- `chats`: `{ title: 'text' }` — for `searchByTitle` (MongoDB text index)
- `messages`: `{ chatId: 1, createdAt: 1 }` — for `findByChatId` (ordered ASC)

**AI SDK `streamText()` with `fullStream` iteration**
`AiSdkProvider.stream()` calls AI SDK's `streamText({ model, messages, tools })` and iterates the returned `fullStream` async iterable. Relevant chunk types mapped to `StreamEvent`:
- `text-delta` → `{ type: 'text', delta: chunk.textDelta }`
- `tool-result` → `{ type: 'tool_result', toolName: chunk.toolName, payload: chunk.result }`

Other chunk types (metadata, usage, finish) are silently skipped. The method is an `async *` generator.

**AI SDK `tool()` helper with Zod schemas from `@repo/shared`**
Each tool file imports its Zod payload schema from `@repo/shared` and passes it as `parameters` to the AI SDK `tool()` helper. The `execute` function receives the parsed, typed input and calls the injected provider. This avoids re-declaring schemas that already exist in the shared package.

**`buildTools(providers)` factory pattern**
`infrastructure/tools/index.ts` exports `buildTools({ dateTimeProvider, weatherProvider })` which returns an object of AI SDK tool definitions ready to pass to `streamText`. Tools that need a provider receive it via closure from the factory argument. This is the only place tools are composed with their providers — `container.ts` will call `buildTools` and pass the result to `AiSdkProvider`.

**WeatherProvider uses native `fetch` against OpenWeatherMap**
`WeatherProvider.getWeather(location)` calls `https://api.openweathermap.org/data/2.5/weather?q={location}&appid={key}&units=metric`. The response is parsed and mapped to `GetWeatherPayload`. No additional HTTP library is needed (Bun has native `fetch`).

**`listByUser` cursor is the `_id` of the last item**
For cursor-based pagination in `MongoChatRepository.listByUser()`, the cursor is the hex string of the last document's `_id`. When a cursor is provided, the query adds `{ _id: { $lt: new ObjectId(cursor) } }` to exclude seen items. Results are sorted `{ isPinned: -1, updatedAt: -1 }` to put pinned chats first.

## Risks / Trade-offs

**[Risk] MongoDB text index only supports one text index per collection** → Mitigation: We create a single text index on `chats.title`. If more fields need text search later, the index must be dropped and recreated — acceptable for this project's scope.

**[Risk] `tool-result` chunk shape may vary across AI SDK versions** → Mitigation: The `AiSdkProvider` is the only file that reads AI SDK chunk internals. Any SDK shape change is isolated to one file.

**[Risk] OpenWeatherMap free tier rate limits** → Mitigation: The tool is called only when the AI explicitly invokes `get_weather`. No caching is needed at this scale.

**[Risk] `ObjectId` cursor pagination assumes insertion-order monotonicity** → Mitigation: ObjectIds are monotonically increasing by design (timestamp prefix). Sorting by `updatedAt` descending with `_id` as tiebreaker cursor is a known pattern; edge cases (same-millisecond inserts) are negligible at this scale.
