## 1. Stream Client

- [x] 1.1 Create `apps/web/app/lib/stream-client.ts` — export `async function* streamChat(chatId: string, content: string): AsyncGenerator<import("@repo/shared").StreamEvent>` that calls `fetch(\`${import.meta.env.VITE_API_URL}/api/stream\`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chatId, content }) })`; reads `response.body` via `getReader()`; decodes chunks with `TextDecoder`; splits on newlines; parses `data: <json>` lines with `JSON.parse`; yields parsed `StreamEvent` objects; stops on `[DONE]` sentinel; throws on non-200 response or `{ type: 'error' }` events

## 2. Tool Cards

- [x] 2.1 Create `apps/web/app/components/conversation/tools/DateCard.tsx` — receives `payload: GetDatePayload`; renders a card showing the date string with a calendar icon or label
- [x] 2.2 Create `apps/web/app/components/conversation/tools/TimeCard.tsx` — receives `payload: GetTimePayload`; renders a card showing the time string with a clock icon or label
- [x] 2.3 Create `apps/web/app/components/conversation/tools/WeatherCard.tsx` — receives `payload: GetWeatherPayload`; renders a card with location, temperature, condition, and humidity

## 3. ToolResultCard

- [x] 3.1 Create `apps/web/app/components/conversation/ToolResultCard.tsx` — receives `{ toolName: string, payload: unknown }`; defines a registry `Record<string, React.FC<{ payload: unknown }>>` mapping `'get_date' → DateCard`, `'get_time' → TimeCard`, `'get_weather' → WeatherCard`; looks up and renders the matching component, or falls back to `<pre>{JSON.stringify(payload, null, 2)}</pre>`

## 4. Message Components

- [x] 4.1 Create `apps/web/app/components/conversation/MessageBubble.tsx` — receives `{ role: MessageRole, content: string, toolResults: ToolResult[] }`; renders user messages right-aligned and assistant messages left-aligned; renders each `toolResult` via `<ToolResultCard>`
- [x] 4.2 Create `apps/web/app/components/conversation/StreamingMessage.tsx` — receives `{ text: string, toolResults: ToolPayload[] }`; renders the live streaming assistant bubble with accumulating text and tool result cards; shows a blinking cursor while text is empty

## 5. MessageList

- [x] 5.1 Create `apps/web/app/components/conversation/MessageList.tsx` — receives `{ messages: MessageDto[], streamingText: string, streamingTools: ToolPayload[], isStreaming: boolean }`; renders persisted `MessageBubble` items then a `StreamingMessage` if `isStreaming`; has a `<div ref={bottomRef}>` anchor at the end; `useEffect` calls `bottomRef.current?.scrollIntoView({ behavior: 'smooth' })` when `messages`, `streamingText`, or `streamingTools` changes

## 6. MessageInput

- [x] 6.1 Create `apps/web/app/components/conversation/MessageInput.tsx` — receives `{ onSubmit: (content: string) => void, isStreaming: boolean }`; controlled textarea; on Enter (without Shift) calls `onSubmit` and clears value; submit button calls `onSubmit` and clears; both are disabled when `isStreaming` or value is empty/whitespace

## 7. Conversation Panel

- [x] 7.1 Create `apps/web/app/components/conversation/Conversation.tsx` — reads `chatId` via `useSearch({ from: '/chat' })`; if no `chatId`, renders empty state; uses `trpc.message.list.useQuery({ chatId }, { enabled: !!chatId })` for persisted history; manages local state `streamingText: string`, `streamingTools: ToolPayload[]`, `isStreaming: boolean`, `error: string | null`; on submit calls `streamChat` generator in a `useCallback`, accumulates text and tool events into state, on `[DONE]` invalidates `utils.message.list` and resets streaming state; on error sets `error` state and resets `isStreaming`; renders `<MessageList>` + `<MessageInput>` in a flex column layout filling the panel height

## 8. Wire Into Chat Route

- [x] 8.1 Update `apps/web/app/routes/chat.tsx` — replace the right-panel `<div>` placeholder with `<Conversation />`; import `Conversation` from `~/components/conversation/Conversation`

## 9. Type Check & Build

- [x] 9.1 Run `pnpm --filter @repo/web typecheck` and fix any type errors
- [x] 9.2 Run `pnpm --filter @repo/web build` and confirm successful build
