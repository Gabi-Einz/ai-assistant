## Why

The `/chat` sidebar is complete but the conversation panel is empty. Users can select and create chats, but cannot send messages or see AI responses. This step wires the right-hand panel: loading history, sending messages, and rendering AI streaming output (text deltas + tool result cards).

## What Changes

- Create `apps/web/app/components/conversation/Conversation.tsx` — panel that orchestrates MessageList + MessageInput; shown when `chatId` URL param is set, empty state when not
- Create `apps/web/app/components/conversation/MessageList.tsx` — renders persisted messages from `trpc.message.list` and the in-progress streaming message; auto-scrolls to bottom
- Create `apps/web/app/components/conversation/MessageInput.tsx` — textarea + submit button; disabled while streaming; triggers the SSE stream on submit
- Create `apps/web/app/components/conversation/StreamingMessage.tsx` — renders the live text being accumulated during a stream; client-only
- Create `apps/web/app/components/conversation/ToolResultCard.tsx` — dispatches `toolName → UIComponent` via a registry; client-only
- Create `apps/web/app/components/conversation/tools/DateCard.tsx` — renders `GetDatePayload`
- Create `apps/web/app/components/conversation/tools/TimeCard.tsx` — renders `GetTimePayload`
- Create `apps/web/app/components/conversation/tools/WeatherCard.tsx` — renders `GetWeatherPayload`
- Create `apps/web/app/lib/stream-client.ts` — thin wrapper around `fetch` + `ReadableStream` that calls `POST /api/stream`, parses `StreamEvent` SSE chunks, and yields events via an async generator
- Update `apps/web/app/routes/chat.tsx` — render `<Conversation />` in the right panel

## Capabilities

### New Capabilities

- `chat-conversation-ui`: Conversation panel — persisted message history, send message, SSE streaming with incremental text rendering and tool result cards (DateCard, TimeCard, WeatherCard)

### Modified Capabilities

<!-- No existing spec-level requirements change -->

## Impact

- **Frontend only** — no backend changes
- Calls `trpc.message.list` (existing tRPC procedure)  
- Calls `POST ${VITE_API_URL}/api/stream` (existing Hono SSE endpoint) with `{ chatId, content }` and browser session cookie
- Consumes `StreamEvent`, `MessageDto`, `GetDatePayload`, `GetTimePayload`, `GetWeatherPayload` types from `@repo/shared`
- Streaming components (`StreamingMessage`, `ToolResultCard`, tool cards) are CSR-only — never server-rendered
