## Why

The domain and application layers are complete but have no concrete implementations behind them — every port interface is still an unfulfilled contract. This step wires in all secondary adapters so that the use cases can actually execute: MongoDB repositories persist data, AiSdkProvider streams AI responses, DateTimeProvider and WeatherProvider supply tool inputs, and tool adapters expose the AI's callable actions.

## What Changes

- `apps/api/src/infrastructure/db/mongo.ts` — MongoDB client setup; exports a typed `db` handle; creates all required indexes at startup
- `apps/api/src/infrastructure/repositories/mongo-chat.repository.ts` — Implements `IChatRepository` using the MongoDB native driver; handles ObjectId ↔ string conversion at the boundary
- `apps/api/src/infrastructure/repositories/mongo-message.repository.ts` — Implements `IMessageRepository`; stores and retrieves messages ordered by `createdAt ASC`
- `apps/api/src/infrastructure/ai/ai-sdk.provider.ts` — Implements `IAIProvider`; uses AI SDK `streamText()` with Anthropic model; maps AI SDK chunks to `StreamEvent` values
- `apps/api/src/infrastructure/providers/datetime.provider.ts` — Implements `IDateTimeProvider`; returns current ISO date and HH:MM:SS time via system clock
- `apps/api/src/infrastructure/providers/weather.provider.ts` — Implements `IWeatherProvider`; fetches current weather from OpenWeatherMap API using `WEATHER_API_KEY`
- `apps/api/src/infrastructure/tools/get-date.tool.ts` — AI SDK tool definition: name, description, Zod schema, `execute` using `IDateTimeProvider`
- `apps/api/src/infrastructure/tools/get-time.tool.ts` — AI SDK tool definition: name, description, Zod schema, `execute` using `IDateTimeProvider`
- `apps/api/src/infrastructure/tools/get-weather.tool.ts` — AI SDK tool definition: name, description, Zod schema, `execute` using `IWeatherProvider`
- `apps/api/src/infrastructure/tools/index.ts` — Barrel that exports a `buildTools(providers)` factory returning the AI SDK tool registry

## Capabilities

### New Capabilities
- `mongodb-connection`: MongoDB client initialization, typed `db` handle export, and index creation at startup
- `mongo-repositories`: `MongoChatRepository` and `MongoMessageRepository` implementing their respective port interfaces with ObjectId boundary conversion
- `secondary-providers`: `AiSdkProvider` (AI SDK + Anthropic), `DateTimeProvider` (system clock), and `WeatherProvider` (OpenWeatherMap HTTP)
- `tool-adapters`: Three AI SDK tool definitions (get_date, get_time, get_weather) and a `buildTools` factory that composes them with their providers

### Modified Capabilities

## Impact

- Introduces runtime dependencies: `mongodb`, `ai` (AI SDK), `@ai-sdk/anthropic`, `zod` (already present in shared)
- Reads env vars: `MONGODB_URI`, `AI_API_KEY`, `WEATHER_API_KEY`
- All files land in `apps/api/src/infrastructure/` — no domain or application files change
- `container.ts` (step 6) will import and wire these adapters; no wiring is done in this step
- The `get-weather` tool makes an outbound HTTP call to OpenWeatherMap at `api.openweathermap.org/data/2.5/weather`
