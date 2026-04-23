## ADDED Requirements

### Requirement: initContainer wires all adapters and use cases in dependency order
`apps/api/src/infrastructure/container.ts` SHALL export `async function initContainer(db: Db): Promise<Container>` that instantiates adapters and use cases in this order:
1. `MongoChatRepository(db)` and `MongoMessageRepository(db)`
2. `DateTimeProvider()` and `WeatherProvider(process.env.WEATHER_API_KEY)`
3. `buildTools({ dateTimeProvider, weatherProvider })`
4. `createAnthropic({ apiKey: process.env.AI_API_KEY })('claude-haiku-4-5')` → `LanguageModel`
5. `AiSdkProvider(model, tools)`
6. All eight use cases with their required ports injected

The returned object SHALL contain exactly: `createChat`, `listChats`, `searchChats`, `renameChat`, `pinChat`, `deleteChat`, `sendMessage`, `listMessages`.

#### Scenario: initContainer returns an object with all eight use case keys
- **WHEN** `initContainer(db)` is called with a connected `Db` handle
- **THEN** the returned object has exactly the keys `createChat`, `listChats`, `searchChats`, `renameChat`, `pinChat`, `deleteChat`, `sendMessage`, `listMessages`

#### Scenario: container.ts is the only file importing adapters and use cases together
- **WHEN** the codebase is inspected for files that import both concrete adapter classes and use case classes
- **THEN** only `infrastructure/container.ts` contains both types of imports

#### Scenario: initContainer does not import from domain or application layers directly
- **WHEN** the TypeScript compiler resolves imports in `container.ts`
- **THEN** all domain and application layer types are consumed only through the concrete adapter and use case constructors — no direct domain/application imports are needed beyond what adapters and use cases re-export

### Requirement: Container type is derived from initContainer return type
`container.ts` SHALL export `type Container = Awaited<ReturnType<typeof initContainer>>`. No separate interface duplicating the use case types SHALL be maintained.

#### Scenario: Container type reflects all eight use case instances
- **WHEN** a variable is typed as `Container`
- **THEN** TypeScript provides access to all eight use case properties with their concrete types

### Requirement: container.ts imports no framework or HTTP-layer modules
`container.ts` SHALL NOT import from `hono`, `@trpc/server`, or any HTTP framework module. Its only imports SHALL be infrastructure adapter classes, application use case classes, and `@ai-sdk/anthropic`.

#### Scenario: container.ts has no Hono or tRPC imports
- **WHEN** the TypeScript compiler resolves imports in `container.ts`
- **THEN** no import path contains `hono` or `@trpc/server`
