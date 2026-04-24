## ADDED Requirements

### Requirement: Conversation panel renders for active chat

The conversation panel SHALL be visible when `chatId` is present in the URL search params. When no `chatId` is set, the panel SHALL display an empty state prompting the user to select or create a chat.

#### Scenario: User selects a chat from the sidebar

- **WHEN** the user clicks a chat in the sidebar and `chatId` is written to the URL
- **THEN** the conversation panel loads and displays the message history for that chat

#### Scenario: No chat is selected

- **WHEN** `chatId` is absent from the URL
- **THEN** the conversation panel shows an empty state message

---

### Requirement: Message history loaded from server

The conversation panel SHALL load all persisted messages for the active `chatId` via `trpc.message.list`. The list SHALL display loading and error states. Messages SHALL be sorted by `createdAt` ASC (oldest at top). The view SHALL auto-scroll to the bottom on initial load and on every new message or streaming chunk.

#### Scenario: Message history loads successfully

- **WHEN** the conversation panel mounts with a valid `chatId`
- **THEN** all persisted messages are fetched and rendered in chronological order

#### Scenario: Message history fetch fails

- **WHEN** the `trpc.message.list` query returns an error
- **THEN** an error message is displayed with a retry option

#### Scenario: Chat has no messages yet

- **WHEN** `trpc.message.list` returns an empty array
- **THEN** an empty conversation state is displayed

---

### Requirement: User can send a message

The conversation panel SHALL include a textarea input and a submit button. Submitting SHALL be possible via the button or via pressing Enter (Shift+Enter inserts a newline). The input SHALL be cleared immediately upon submit. The submit button SHALL be disabled while a stream is in progress or when the input is empty.

#### Scenario: User submits a message

- **WHEN** the user types a message and submits
- **THEN** the input is cleared immediately
- **THEN** the message is sent to `POST /api/stream` with the current `chatId` and content

#### Scenario: User presses Enter to submit

- **WHEN** the user presses Enter without Shift
- **THEN** the message is submitted (same behavior as button click)

#### Scenario: User presses Shift+Enter

- **WHEN** the user presses Shift+Enter
- **THEN** a newline is inserted in the textarea without submitting

---

### Requirement: AI response streams incrementally

After the user submits a message, the AI response SHALL appear as a streaming bubble that grows as text delta events arrive. Text deltas SHALL be appended character-by-character in real time. The streaming bubble SHALL be visually distinct from completed messages.

#### Scenario: Text delta events arrive

- **WHEN** the SSE stream emits `{ type: 'text', delta: '...' }` events
- **THEN** each delta is appended to the streaming bubble text without a full re-render of the message list

#### Scenario: Stream completes

- **WHEN** the SSE stream emits `[DONE]`
- **THEN** `isStreaming` is set to false
- **THEN** `trpc.message.list` is invalidated and the persisted messages replace the streaming state

---

### Requirement: Tool results rendered as dedicated components

When the SSE stream emits a `tool_result` event, the corresponding UI card SHALL be rendered immediately below the streaming text. Each tool has a dedicated component:
- `get_date` → `DateCard` (displays the date string)
- `get_time` → `TimeCard` (displays the time string)
- `get_weather` → `WeatherCard` (displays location, temperature, condition, humidity)

Unknown tool names SHALL fall back to a plain JSON display.

#### Scenario: get_date tool result arrives

- **WHEN** the stream emits `{ type: 'tool_result', toolName: 'get_date', payload: { date: '...' } }`
- **THEN** a `DateCard` is rendered showing the date

#### Scenario: get_time tool result arrives

- **WHEN** the stream emits `{ type: 'tool_result', toolName: 'get_time', payload: { time: '...' } }`
- **THEN** a `TimeCard` is rendered showing the time

#### Scenario: get_weather tool result arrives

- **WHEN** the stream emits `{ type: 'tool_result', toolName: 'get_weather', payload: { location, temperature, condition, humidity } }`
- **THEN** a `WeatherCard` is rendered showing all weather fields

#### Scenario: Unknown tool result arrives

- **WHEN** the stream emits a `tool_result` with an unregistered `toolName`
- **THEN** a fallback card is rendered showing the raw JSON payload

---

### Requirement: Stream error handled gracefully

If the SSE stream emits an error event or the fetch itself fails, the conversation panel SHALL display an error message without crashing. `isStreaming` SHALL be set to false so the user can retry.

#### Scenario: Stream emits error event

- **WHEN** the backend emits `{ type: 'error', message: '...' }`
- **THEN** the error message is displayed in the conversation panel
- **THEN** the user can submit a new message

#### Scenario: Network error during streaming

- **WHEN** the fetch to `/api/stream` fails (network error or non-200 response)
- **THEN** an error state is shown
- **THEN** `isStreaming` is reset to false
