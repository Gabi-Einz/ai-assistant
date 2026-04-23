## Requirements

### Requirement: Tool payload schemas are defined with Zod and exported from packages/shared
`packages/shared` SHALL export a Zod schema for each AI tool payload: `getDatePayloadSchema`, `getTimePayloadSchema`, and `getWeatherPayloadSchema`. Each schema SHALL be paired with a TypeScript type inferred via `z.infer<>`: `GetDatePayload`, `GetTimePayload`, and `GetWeatherPayload`.

#### Scenario: get_date payload schema is valid
- **WHEN** a value `{ date: "2026-04-22" }` is parsed with `getDatePayloadSchema`
- **THEN** it returns `{ date: "2026-04-22" }` without errors and the type is `GetDatePayload`

#### Scenario: get_time payload schema is valid
- **WHEN** a value `{ time: "14:30:00" }` is parsed with `getTimePayloadSchema`
- **THEN** it returns `{ time: "14:30:00" }` without errors and the type is `GetTimePayload`

#### Scenario: get_weather payload schema is valid
- **WHEN** a value `{ location: "Buenos Aires", temperature: 22, condition: "Sunny", humidity: 60 }` is parsed with `getWeatherPayloadSchema`
- **THEN** it returns the value without errors and the type is `GetWeatherPayload`

#### Scenario: get_weather payload rejects missing field
- **WHEN** a value missing `temperature` is parsed with `getWeatherPayloadSchema`
- **THEN** Zod throws a `ZodError` listing the missing field

### Requirement: ToolPayload is a discriminated union keyed by toolName
`packages/shared` SHALL export a `ToolPayload` type that is a discriminated union of all tool payload variants, each with a `toolName` literal discriminant: `{ toolName: 'get_date'; payload: GetDatePayload }`, `{ toolName: 'get_time'; payload: GetTimePayload }`, and `{ toolName: 'get_weather'; payload: GetWeatherPayload }`.

#### Scenario: narrowing ToolPayload by toolName gives typed payload
- **WHEN** a `ToolPayload` value with `toolName === 'get_weather'` is narrowed in a switch/if block
- **THEN** TypeScript infers `payload` as `GetWeatherPayload` without a cast

#### Scenario: exhaustiveness check catches missing tool
- **WHEN** a switch statement over `ToolPayload['toolName']` omits one case and uses a `never` check
- **THEN** TypeScript reports a type error until all cases are handled

### Requirement: Tool payload types are importable from the package root
All payload schemas and the `ToolPayload` union SHALL be importable from `@repo/shared` (the package root) without deep path imports.

#### Scenario: backend tool adapter imports payload schema
- **WHEN** `apps/api/src/infrastructure/tools/get-weather.tool.ts` imports `getWeatherPayloadSchema` from `@repo/shared`
- **THEN** TypeScript resolves the import without error

#### Scenario: frontend component imports payload type
- **WHEN** `apps/web/app/components/WeatherCard.tsx` imports `GetWeatherPayload` from `@repo/shared`
- **THEN** TypeScript resolves the import without error
