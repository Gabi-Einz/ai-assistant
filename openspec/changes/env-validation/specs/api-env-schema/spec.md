## ADDED Requirements

### Requirement: env.ts validates all required API environment variables at startup
`apps/api/src/env.ts` SHALL export a const `env` produced by parsing `process.env` against a Zod schema. The schema SHALL require: `MONGODB_URI` (non-empty string), `AI_API_KEY` (non-empty string), `WEATHER_API_KEY` (non-empty string), `BETTERAUTH_SECRET` (non-empty string). It SHALL include `PORT` as an optional coerced integer defaulting to `3000`. If any required variable is absent or empty, the module SHALL throw a `ZodError` with a descriptive message before any other application code runs.

#### Scenario: All required vars present — env object is typed and available
- **WHEN** all four required environment variables are set to non-empty strings
- **THEN** `env.MONGODB_URI`, `env.AI_API_KEY`, `env.WEATHER_API_KEY`, `env.BETTERAUTH_SECRET` are available as `string` and `env.PORT` is available as `number`

#### Scenario: Missing required var throws at import time
- **WHEN** any of the four required variables is absent from the environment
- **THEN** importing `env.ts` throws a `ZodError` and the process does not start

#### Scenario: PORT defaults to 3000 when not set
- **WHEN** `PORT` is not set in the environment
- **THEN** `env.PORT` equals `3000`

#### Scenario: PORT is coerced from string to number
- **WHEN** `PORT` is set to the string `"8080"`
- **THEN** `env.PORT` equals the number `8080`

### Requirement: All process.env usages in the API are replaced by env.X
`apps/api/src/infrastructure/container.ts`, `apps/api/src/infrastructure/auth/better-auth.adapter.ts`, `apps/api/src/infrastructure/db/mongo.ts`, and `apps/api/src/index.ts` SHALL NOT use `process.env` directly. They SHALL import `env` from `../../env` (or the appropriate relative path) and access validated values via `env.X`.

#### Scenario: container.ts uses env.AI_API_KEY and env.WEATHER_API_KEY
- **WHEN** `initContainer` is called
- **THEN** the Anthropic client and WeatherProvider are initialised with values from `env`, not `process.env`

#### Scenario: better-auth.adapter.ts uses env.BETTERAUTH_SECRET
- **WHEN** `createBetterAuth` is called
- **THEN** BetterAuth is configured with `env.BETTERAUTH_SECRET`

#### Scenario: index.ts uses env.PORT
- **WHEN** the server starts
- **THEN** `Bun.serve` (or the export) uses `env.PORT` as the port number

### Requirement: Per-app .env.example files document required variables
`apps/api/.env.example` SHALL list all five variables (`MONGODB_URI`, `AI_API_KEY`, `WEATHER_API_KEY`, `BETTERAUTH_SECRET`, `PORT`) with a one-line comment describing each. `apps/web/.env.example` SHALL list `VITE_API_URL` with a comment. Both files SHALL have empty values (e.g. `MONGODB_URI=`) so they can be copied to `.env` and filled in.

#### Scenario: apps/api/.env.example lists all API env vars
- **WHEN** a developer reads `apps/api/.env.example`
- **THEN** they see all variables required to run the API locally with descriptions

#### Scenario: apps/web/.env.example lists VITE_API_URL
- **WHEN** a developer reads `apps/web/.env.example`
- **THEN** they see `VITE_API_URL=` with a description of what value to set
