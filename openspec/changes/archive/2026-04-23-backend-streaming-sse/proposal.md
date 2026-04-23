## Why

The `SendMessageUseCase` is implemented and yields `StreamEvent` objects via an async generator, but there is no HTTP endpoint that exposes this stream to the frontend. Without a streaming endpoint, the AI assistant cannot render incremental text deltas or tool-result events in real time.

## What Changes

- Add `POST /api/stream` Hono route that authenticates the request, validates input (`chatId`, `content`), invokes `SendMessageUseCase`, and streams the response as Server-Sent Events (SSE)
- Each `StreamEvent` yielded by the use case is serialized as a JSON SSE `data:` line; the stream closes with a `[DONE]` sentinel
- Mount the new route in the existing Hono app factory (`infrastructure/http/app.ts`)
- No tRPC involvement — this is a raw Hono route because tRPC does not natively support SSE in the fetch adapter used here

## Capabilities

### New Capabilities
- `sse-stream-endpoint`: Authenticated Hono SSE route that drives `SendMessageUseCase` and forwards `StreamEvent` objects to the client as newline-delimited JSON SSE frames

### Modified Capabilities
<!-- none — no existing spec-level behavior changes -->

## Impact

- `apps/api/src/infrastructure/http/app.ts` — new route mounted alongside existing tRPC and BetterAuth routes
- `apps/api/src/infrastructure/http/stream.route.ts` — new file implementing the route handler
- Frontend (step 13) — uses `EventSource` or `fetch` + `ReadableStream` against `POST /api/stream`
