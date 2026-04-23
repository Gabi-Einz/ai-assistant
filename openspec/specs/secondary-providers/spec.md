## ADDED Requirements

### Requirement: AiSdkProvider implements IAIProvider using AI SDK streamText
`apps/api/src/infrastructure/ai/ai-sdk.provider.ts` SHALL export `AiSdkProvider` implementing `IAIProvider`. Its constructor SHALL accept an AI SDK `LanguageModel` and a tool registry object. Its `stream()` method SHALL be an async generator that calls AI SDK `streamText({ model, messages, tools })`, iterates `fullStream`, maps `text-delta` chunks to `{ type: 'text', delta }` StreamEvents, maps `tool-result` chunks to `{ type: 'tool_result', toolName, payload }` StreamEvents, and silently skips all other chunk types.

#### Scenario: stream yields text-delta chunks as StreamEvent text events
- **WHEN** `streamText` emits a chunk of type `text-delta` with `textDelta: 'Hello'`
- **THEN** `stream()` yields `{ type: 'text', delta: 'Hello' }`

#### Scenario: stream yields tool-result chunks as StreamEvent tool_result events
- **WHEN** `streamText` emits a chunk of type `tool-result` with `toolName: 'get_date'` and `result: { date: '2026-04-23' }`
- **THEN** `stream()` yields `{ type: 'tool_result', toolName: 'get_date', payload: { toolName: 'get_date', payload: { date: '2026-04-23' } } }`

#### Scenario: stream skips non-text non-tool-result chunks
- **WHEN** `streamText` emits a `finish` or `usage` chunk
- **THEN** `stream()` does not yield any event for those chunks

#### Scenario: stream converts Message history to AI SDK CoreMessage format
- **WHEN** `stream(history, tools)` is called with a `Message[]` where roles are 'user' and 'assistant'
- **THEN** `streamText` is called with `messages` where each has `role` and `content` mapped from the domain `Message`

### Requirement: DateTimeProvider implements IDateTimeProvider using the system clock
`apps/api/src/infrastructure/providers/datetime.provider.ts` SHALL export `DateTimeProvider` implementing `IDateTimeProvider`. `getCurrentDate()` SHALL return the current date as an ISO 8601 date string (e.g., `"2026-04-23"`). `getCurrentTime()` SHALL return the current time as `"HH:MM:SS"` in 24-hour format. Both methods are synchronous.

#### Scenario: getCurrentDate returns today's date in YYYY-MM-DD format
- **WHEN** `getCurrentDate()` is called
- **THEN** the returned string matches the pattern `YYYY-MM-DD` and equals the current UTC date

#### Scenario: getCurrentTime returns the current time in HH:MM:SS format
- **WHEN** `getCurrentTime()` is called
- **THEN** the returned string matches the pattern `HH:MM:SS` (zero-padded, 24-hour)

### Requirement: WeatherProvider implements IWeatherProvider using OpenWeatherMap
`apps/api/src/infrastructure/providers/weather.provider.ts` SHALL export `WeatherProvider` implementing `IWeatherProvider`. Its constructor SHALL accept the `WEATHER_API_KEY` string. `getWeather(location)` SHALL call `https://api.openweathermap.org/data/2.5/weather?q={location}&appid={key}&units=metric` using native `fetch`, parse the JSON response, and return a `GetWeatherPayload` with `location`, `temperature` (rounded integer), `condition` (weather description), and `humidity`.

#### Scenario: getWeather returns a typed payload on success
- **WHEN** `getWeather('Buenos Aires')` is called and the API responds with valid JSON
- **THEN** the returned object satisfies `GetWeatherPayload` with all four fields populated

#### Scenario: getWeather throws on non-200 API response
- **WHEN** the OpenWeatherMap API returns a 404 or 401 status
- **THEN** `getWeather` throws an error with a message indicating the failure
