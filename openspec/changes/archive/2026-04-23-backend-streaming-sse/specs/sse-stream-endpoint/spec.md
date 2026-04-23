## ADDED Requirements

### Requirement: POST /api/stream authenticates the request before streaming
The `POST /api/stream` route SHALL validate the BetterAuth session from the request headers before doing any work. If no valid session exists, it SHALL return HTTP 401 and close the connection without starting a stream.

#### Scenario: Unauthenticated request is rejected
- **WHEN** `POST /api/stream` is called without a valid session cookie
- **THEN** the server responds with HTTP 401 and does not open an SSE stream

#### Scenario: Authenticated request proceeds to stream
- **WHEN** `POST /api/stream` is called with a valid BetterAuth session cookie
- **THEN** the server reads `userId` from the session and proceeds to validate the request body

### Requirement: POST /api/stream validates chatId and content from the request body
The route SHALL parse the JSON request body and require both `chatId` (non-empty string) and `content` (non-empty string). If either field is missing or empty, it SHALL return HTTP 400 and not open a stream.

#### Scenario: Missing chatId returns 400
- **WHEN** `POST /api/stream` is called with a body that omits `chatId`
- **THEN** the server responds with HTTP 400

#### Scenario: Empty content returns 400
- **WHEN** `POST /api/stream` is called with `content: ""`
- **THEN** the server responds with HTTP 400

### Requirement: POST /api/stream streams StreamEvents as SSE frames
The route SHALL set `Content-Type: text/event-stream` and stream each `StreamEvent` yielded by `SendMessageUseCase` as a `data: <JSON>\n\n` SSE frame. After the generator is exhausted, it SHALL emit `data: [DONE]\n\n` and close the response.

#### Scenario: Text delta events are streamed as JSON SSE frames
- **WHEN** `SendMessageUseCase` yields `{ type: 'text', delta: 'Hello' }`
- **THEN** the SSE stream emits `data: {"type":"text","delta":"Hello"}\n\n`

#### Scenario: Tool result events are streamed as JSON SSE frames
- **WHEN** `SendMessageUseCase` yields `{ type: 'tool_result', toolName: 'get_weather', payload: {...} }`
- **THEN** the SSE stream emits `data: {"type":"tool_result","toolName":"get_weather","payload":{...}}\n\n`

#### Scenario: Stream ends with [DONE] sentinel
- **WHEN** `SendMessageUseCase` generator is exhausted
- **THEN** the SSE stream emits `data: [DONE]\n\n` and the connection closes

### Requirement: POST /api/stream emits an error event on mid-stream failure
If `SendMessageUseCase` throws after the stream has already started, the route SHALL emit `data: {"type":"error","message":"<description>"}\n\n` followed by `data: [DONE]\n\n` and close the connection.

#### Scenario: Use case error after stream start emits error event then DONE
- **WHEN** `SendMessageUseCase` throws an error after at least one event has been yielded
- **THEN** the SSE stream emits an error event frame and then the `[DONE]` frame before closing

### Requirement: POST /api/stream is mounted in the Hono app
The `stream.route.ts` handler SHALL be mounted in `infrastructure/http/app.ts` at `/api`, making the full path `POST /api/stream`. It SHALL receive the `Container` and `Auth` instances from the app factory — no global singletons.

#### Scenario: /api/stream route is reachable on the running server
- **WHEN** the Hono app is started and a POST request is made to `/api/stream`
- **THEN** the server handles the request (auth check runs, not a 404)
