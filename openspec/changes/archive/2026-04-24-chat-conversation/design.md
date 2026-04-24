## Context

The backend exposes two endpoints relevant to this step:
- `GET /trpc/message.list` — returns `MessageDto[]` for a `chatId` (persisted history)
- `POST /api/stream` — accepts `{ chatId, content }`, authenticates via session cookie, returns SSE stream of `StreamEvent` JSON lines ending with `[DONE]`

`StreamEvent` is a discriminated union from `@repo/shared`:
- `{ type: 'text', delta: string }` — text chunk to append
- `{ type: 'tool_result', toolName: string, payload: ToolPayload }` — completed tool call

The streaming endpoint is a raw Hono SSE route, not tRPC. The browser's `fetch` API with `credentials: 'include'` handles cookie forwarding automatically for cross-origin, or automatically for same-origin.

## Goals / Non-Goals

**Goals:**
- Load and display persisted message history for the active `chatId`
- Send a new message and stream the AI response in real time
- Render text deltas incrementally in the streaming bubble
- Render each tool result as a dedicated typed UI card
- Show empty, loading, and error states
- Auto-scroll to the bottom as new content arrives

**Non-Goals:**
- Markdown rendering of message content (plain text only)
- Message editing, deletion, or regeneration
- Multi-modal (image, file) input
- Pagination of message history (all messages for a chat are loaded at once)

## Decisions

### D1: Streaming via fetch + ReadableStream, not EventSource

`EventSource` is GET-only; the streaming endpoint requires POST. The `fetch` API with `response.body.getReader()` reads SSE chunks as `Uint8Array`, decoded to text and split on `\n\n` to extract `data:` lines. This is encapsulated in `stream-client.ts` as an async generator: `async function* streamChat(chatId, content): AsyncGenerator<StreamEvent>`.

### D2: Streaming state in local component state, not TanStack Query

The in-flight stream (accumulating text + tool results) is transient — it does not belong in the server state cache. `Conversation.tsx` holds:
- `streamingText: string` — text accumulated so far
- `streamingTools: ToolPayload[]` — tool results received during the current stream
- `isStreaming: boolean` — whether a stream is in progress

On stream end (`[DONE]`), TanStack Query invalidates `message.list` and the persisted messages replace the streaming state.

### D3: Tool component registry as a plain map

```ts
const toolRegistry: Record<string, React.FC<{ payload: unknown }>> = {
  get_date: DateCard,
  get_time: TimeCard,
  get_weather: WeatherCard,
}
```

`ToolResultCard` receives `{ toolName, payload }` and looks up the component. Unknown tool names fall back to a generic JSON dump. Adding a new tool requires only a new card component + one registry entry.

### D4: MessageList renders two sources

`MessageList` receives `messages: MessageDto[]` (persisted history) and `streamingText / streamingTools` (in-flight). It renders persisted messages first, then — if streaming — a live `StreamingMessage` bubble. This means no mixing of server and client state; the streaming state is always appended at the bottom.

### D5: Auto-scroll via useEffect on a bottom anchor ref

A `<div ref={bottomRef}>` at the end of the message list. A `useEffect` calls `bottomRef.current?.scrollIntoView({ behavior: 'smooth' })` whenever `messages`, `streamingText`, or `streamingTools` changes.

### D6: MessageInput blocks during streaming

`MessageInput` receives `isStreaming` and disables the textarea and button. The submit handler fires only when `!isStreaming && chatId`. On submit it clears the input, sets `isStreaming: true`, calls `streamChat(chatId, content)`, processes events, then sets `isStreaming: false` and invalidates the query.

## Risks / Trade-offs

- **SSE reconnect on disconnect**: No reconnection logic; if the stream breaks mid-response, the user sees truncated output. Acceptable for this scope — a retry button or reconnect would add significant complexity.
- **No streaming abort**: The stream runs to completion even if the user navigates away. Acceptable for now; a proper abort would need an `AbortController` passed into the fetch.
- **History load performance**: All messages for a chat are loaded at once. For very long chats this could be slow. Acceptable given the scope; pagination is marked as a non-goal.

## Open Questions

None — all decisions sufficient to proceed.
