## ADDED Requirements

### Requirement: AppContext spreads all container use cases and exposes userId
`apps/api/src/infrastructure/trpc/context.ts` SHALL export `interface AppContext` containing all eight use case properties (typed from `Container`) plus `userId: string | null`. `userId` is `null` in this step; real extraction is added in step 7.

#### Scenario: AppContext has all eight use case properties
- **WHEN** a variable is typed as `AppContext`
- **THEN** TypeScript provides access to `createChat`, `listChats`, `searchChats`, `renameChat`, `pinChat`, `deleteChat`, `sendMessage`, `listMessages`, and `userId`

#### Scenario: AppContext userId is string or null
- **WHEN** a procedure accesses `ctx.userId`
- **THEN** TypeScript types it as `string | null`, requiring a null check before use

### Requirement: createContextFactory returns a per-request context creator
`context.ts` SHALL export `function createContextFactory(container: Container)` that returns a function `createContext({ req: Request }): AppContext`. The returned `createContext` function SHALL spread all use cases from `container` into the returned object and set `userId: null`.

#### Scenario: createContextFactory returns a function
- **WHEN** `createContextFactory(container)` is called with a valid container
- **THEN** the return value is a function that accepts `{ req: Request }` and returns `AppContext`

#### Scenario: createContext spreads all container use cases into context
- **WHEN** `createContext({ req })` is called
- **THEN** the returned object contains all use case instances from the container with no additional wrapping

#### Scenario: createContext sets userId to null in this step
- **WHEN** `createContext({ req })` is called with any request
- **THEN** `ctx.userId` is `null` (BetterAuth session extraction is added in step 7)
