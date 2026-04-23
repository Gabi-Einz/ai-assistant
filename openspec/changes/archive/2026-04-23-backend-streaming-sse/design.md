## Context

`SendMessageUseCase.execute({ chatId, userId, content })` is an async generator that yields `StreamEvent` objects (`{ type: 'text', delta: string }` and `{ type: 'tool_result', toolName: string, payload: ToolPayload }`). The use case saves the user message, streams AI deltas, and persists the assistant message — all as a single generator pass. The frontend needs to receive these events incrementally as the AI responds.

tRPC (step 7) handles all CRUD operations. The streaming send-message path is intentionally kept outside tRPC because Hono's `streamSSE` helper (or a manual `ReadableStream`) gives direct control over the SSE wire format needed by the frontend.

## Goals / Non-Goals

**Goals:**
- `POST /api/stream` route: auth-gated, validates `chatId` + `content`, drives `SendMessageUseCase`, emits each `StreamEvent` as a JSON SSE frame
- Clean stream termination: send a `data: [DONE]` sentinel and close the response on generator completion or error
- Session-based auth using `auth.api.getSession` (same pattern as tRPC auth middleware)
- CORS header `Access-Control-Allow-Origin: *` (or configured origin) so the browser frontend can reach it during development

**Non-Goals:**
- WebSocket transport — SSE is sufficient and simpler for a unidirectional server-to-client stream
- tRPC subscription — would require wrapping the generator in an observable, adds complexity for no benefit here
- Reconnection logic — the client handles reconnects if needed; the server just streams once per request
- Rate limiting or message queue — out of scope for this challenge

## Decisions

### HTTP method: POST
The request carries a body (`chatId`, `content`), ruling out GET. SSE is conventionally GET, but a POST SSE with a JSON body is fully valid in the fetch API. The frontend uses `fetch` with `{ method: 'POST', body: JSON.stringify({...}) }` and reads the response body as a `ReadableStream` — not `EventSource` (which only supports GET).

**Alternative considered**: GET with query params. Rejected — `content` can be long and arbitrary; query strings are not suited for message bodies.

### SSE wire format
Each event is a single `data:` line containing the JSON-serialised `StreamEvent`, followed by two newlines:
```
data: {"type":"text","delta":"Hello"}\n\n
data: {"type":"tool_result","toolName":"get_weather","payload":{...}}\n\n
data: [DONE]\n\n
```
The `[DONE]` sentinel lets the client know the stream ended cleanly without relying on connection close detection.

**Alternative considered**: `event:` + `data:` named events (e.g. `event: text`). Rejected — adds parsing complexity on the client with no benefit; a `type` field in the JSON is sufficient.

### Hono streaming helper vs. manual ReadableStream
Hono ships `streamSSE` (from `hono/streaming`) which handles the SSE headers and `data:` framing automatically. Using it keeps the route handler concise and avoids manually managing the `Content-Type: text/event-stream` header and `Transfer-Encoding`.

### Auth: inline session check (no middleware reuse)
The auth check is done inline at the top of the route handler using `auth.api.getSession({ headers: c.req.raw.headers })`. Reusing tRPC's `authMiddleware` is not possible here (it's a tRPC primitive). A shared helper function could extract the session check, but for a single route the inline approach is simpler and equally readable.

### Route mounted in app.ts
`stream.route.ts` exports a factory `createStreamRoute(container, auth)` returning a Hono instance or router. `app.ts` mounts it at `/api` via `app.route('/api', streamRoute)`. This keeps `app.ts` as the single mount-point file and keeps the route handler in its own file.

### Input validation
`chatId` and `content` are parsed from the JSON request body. Validated inline with simple checks (non-empty strings). No Zod schema here — the payload is trivially simple and adding Zod for two fields would be over-engineering for a non-tRPC route.

## Risks / Trade-offs

- **Error mid-stream**: If `SendMessageUseCase` throws after the stream has started (headers already sent), the only recourse is to emit a `data: {"type":"error","message":"..."}` event and then `[DONE]`. The client must handle this gracefully. Mitigation: wrap the generator iteration in try/catch; emit error event before closing.
- **Bun SSE buffering**: Bun's HTTP server may buffer small writes. `streamSSE` / `ReadableStream` flushes on each `write()` call, so buffering is not expected to be an issue in practice.
- **No auth on OPTIONS preflight**: CORS preflight (`OPTIONS /api/stream`) must be allowed without auth. Hono's CORS middleware handles this if configured; the route handler only validates `POST`.
