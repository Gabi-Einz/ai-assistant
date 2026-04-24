## Why

The application has no automated tests. Use cases contain the core business logic (auth guards, error paths, streaming orchestration) and are the highest-value target; integration tests validate that the Hono app, tRPC routers, and middleware wire together correctly end-to-end.

## What Changes

- Add unit tests for all eight use cases using `bun:test` with manually mocked port interfaces
- Add integration tests for the tRPC chat and message routers using `@hono/testing` + `bun:test`
- Configure `bun test` as a Turborepo task in `apps/api`

## Capabilities

### New Capabilities

- `api-test-suite`: Unit tests for all use cases and integration tests for tRPC routers; exercises happy paths, not-found errors, and unauthorized access

### Modified Capabilities

## Impact

- New test files under `apps/api/src/__tests__/`
- `package.json` test script in `apps/api`
- `turbo.json` test task (if not already present)
- No production code changes
