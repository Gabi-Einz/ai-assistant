## ADDED Requirements

### Requirement: get_date tool adapter calls IDateTimeProvider and returns GetDatePayload
`apps/api/src/infrastructure/tools/get-date.tool.ts` SHALL export a factory function `buildGetDateTool(dateTimeProvider: IDateTimeProvider)` that returns an AI SDK tool definition with `description` describing what the tool does, `parameters: z.object({})` (no input required), and an `execute` function that calls `dateTimeProvider.getCurrentDate()` and returns `{ date: string }` matching `GetDatePayload`.

#### Scenario: get_date execute returns current date from provider
- **WHEN** `execute({})` is called
- **THEN** `dateTimeProvider.getCurrentDate()` is called and its return value is wrapped as `{ date: <result> }`

### Requirement: get_time tool adapter calls IDateTimeProvider and returns GetTimePayload
`apps/api/src/infrastructure/tools/get-time.tool.ts` SHALL export a factory function `buildGetTimeTool(dateTimeProvider: IDateTimeProvider)` that returns an AI SDK tool definition with `parameters: z.object({})` and an `execute` function that calls `dateTimeProvider.getCurrentTime()` and returns `{ time: string }` matching `GetTimePayload`.

#### Scenario: get_time execute returns current time from provider
- **WHEN** `execute({})` is called
- **THEN** `dateTimeProvider.getCurrentTime()` is called and its return value is wrapped as `{ time: <result> }`

### Requirement: get_weather tool adapter calls IWeatherProvider and returns GetWeatherPayload
`apps/api/src/infrastructure/tools/get-weather.tool.ts` SHALL export a factory function `buildGetWeatherTool(weatherProvider: IWeatherProvider)` that returns an AI SDK tool definition with `parameters: z.object({ location: z.string() })` and an `execute` function that calls `weatherProvider.getWeather(location)` and returns the result as `GetWeatherPayload`.

#### Scenario: get_weather execute calls provider with the location parameter
- **WHEN** `execute({ location: 'London' })` is called
- **THEN** `weatherProvider.getWeather('London')` is called and its result is returned

### Requirement: buildTools factory composes all tool adapters into a registry
`apps/api/src/infrastructure/tools/index.ts` SHALL export `buildTools({ dateTimeProvider, weatherProvider })` that returns an object with keys `get_date`, `get_time`, and `get_weather`, each being an AI SDK tool definition created by the respective factory function. This object is directly passable as the `tools` argument to AI SDK `streamText`.

#### Scenario: buildTools returns an object with all three tool keys
- **WHEN** `buildTools({ dateTimeProvider, weatherProvider })` is called with valid providers
- **THEN** the returned object has exactly the keys `get_date`, `get_time`, and `get_weather`

#### Scenario: tool keys in buildTools output match their toolName identifiers
- **WHEN** the object returned by `buildTools` is used as `tools` in `streamText`
- **THEN** AI SDK resolves tool calls by matching the key name to the tool invocation name in the model response
