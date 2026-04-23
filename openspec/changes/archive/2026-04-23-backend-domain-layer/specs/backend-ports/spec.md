## ADDED Requirements

### Requirement: IChatRepository defines the full chat persistence contract
`apps/api/src/domain/ports/chat-repository.port.ts` SHALL export an `IChatRepository` interface with the following methods:
- `create(userId: string, title: string): Promise<Chat>`
- `findById(id: string): Promise<Chat | null>`
- `listByUser(userId: string, cursor: string | null, limit: number): Promise<Chat[]>`
- `searchByTitle(userId: string, query: string): Promise<Chat[]>`
- `rename(id: string, title: string): Promise<void>`
- `togglePin(id: string): Promise<void>`
- `delete(id: string): Promise<void>`

No import from MongoDB driver, Zod, or any infrastructure module SHALL appear in this file. Only `Chat` from `domain/entities/chat.entity.ts` is permitted.

#### Scenario: IChatRepository enforces all method signatures
- **WHEN** a class implements `IChatRepository` with a method signature mismatch (e.g., `create` returning `Promise<string>`)
- **THEN** TypeScript reports a type error at the class declaration

#### Scenario: IChatRepository listByUser supports cursor-based pagination
- **WHEN** a value is used as `IChatRepository` and `listByUser` is called with `cursor: null`
- **THEN** TypeScript accepts the call without error, indicating the first page (no cursor)

### Requirement: IMessageRepository defines the message persistence contract
`apps/api/src/domain/ports/message-repository.port.ts` SHALL export an `IMessageRepository` interface with:
- `save(message: Omit<Message, '_id'>): Promise<Message>`
- `findByChatId(chatId: string): Promise<Message[]>`
- `deleteByChatId(chatId: string): Promise<void>`

#### Scenario: IMessageRepository enforces save input shape
- **WHEN** a class implementing `IMessageRepository` has `save` accept a full `Message` (including `_id`)
- **THEN** TypeScript reports a type error because `_id` is not part of the `Omit<Message, '_id'>` input

#### Scenario: IMessageRepository returns messages ordered by createdAt ascending
- **WHEN** `findByChatId` is declared in an implementing class returning `Promise<Message[]>`
- **THEN** TypeScript accepts the signature; ordering is an implementation invariant enforced by repository tests

### Requirement: IAIProvider defines the streaming AI contract
`apps/api/src/domain/ports/ai-provider.port.ts` SHALL export an `IAIProvider` interface with:
- `stream(history: Message[], tools: unknown[]): AsyncIterable<StreamEvent>`

`StreamEvent` SHALL be imported from `@repo/shared`. The `tools` parameter is typed `unknown[]` at the domain level — concrete typing is an infrastructure concern.

#### Scenario: IAIProvider stream method returns AsyncIterable<StreamEvent>
- **WHEN** a class implementing `IAIProvider` has `stream` returning `ReadableStream<StreamEvent>`
- **THEN** TypeScript reports a type error because `ReadableStream` is not assignable to `AsyncIterable<StreamEvent>`

#### Scenario: IAIProvider imports StreamEvent from @repo/shared only
- **WHEN** the TypeScript compiler resolves imports in `ai-provider.port.ts`
- **THEN** only `@repo/shared` and `domain/entities/message.entity.ts` appear as import sources

### Requirement: IDateTimeProvider defines the datetime query contract
`apps/api/src/domain/ports/datetime-provider.port.ts` SHALL export an `IDateTimeProvider` interface with:
- `getCurrentDate(): string` — returns ISO 8601 date string (e.g., `"2026-04-23"`)
- `getCurrentTime(): string` — returns HH:MM:SS time string (e.g., `"14:30:00"`)

#### Scenario: IDateTimeProvider methods have no parameters
- **WHEN** a class implementing `IDateTimeProvider` declares `getCurrentDate(tz: string): string`
- **THEN** TypeScript reports a type error due to parameter mismatch

#### Scenario: IDateTimeProvider has no imports
- **WHEN** the TypeScript compiler resolves imports in `datetime-provider.port.ts`
- **THEN** no import statements appear in the file (it is fully self-contained)

### Requirement: IWeatherProvider defines the weather query contract
`apps/api/src/domain/ports/weather-provider.port.ts` SHALL export an `IWeatherProvider` interface with:
- `getWeather(location: string): Promise<GetWeatherPayload>`

`GetWeatherPayload` SHALL be imported from `@repo/shared`.

#### Scenario: IWeatherProvider getWeather accepts a location string
- **WHEN** a class implementing `IWeatherProvider` has `getWeather` accepting `{ city: string }`
- **THEN** TypeScript reports a type error because the parameter type does not match `string`

#### Scenario: IWeatherProvider imports GetWeatherPayload from @repo/shared only
- **WHEN** the TypeScript compiler resolves imports in `weather-provider.port.ts`
- **THEN** only `@repo/shared` appears as an import source
