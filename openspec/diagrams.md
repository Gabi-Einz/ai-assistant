# Diagrams

---

## 1. Architecture Overview — Hexagonal Layers

```mermaid
graph TB
    subgraph BROWSER["Browser"]
        B["React 19 + TanStack Start\n(TanStack Router + Query — CSR / SSR hydration)"]
    end

    subgraph PRIMARY["Infrastructure — Primary Adapters"]
        HONO["Hono HTTP App\n(app.ts)"]
        AUTH_MW["Auth Middleware\n(BetterAuth)"]
        TRPC_R["tRPC Routers\n(chat · message)"]
        CTX["tRPC Context\n(context.ts — injects use cases)"]
    end

    subgraph APP["Application Layer"]
        UC_CHAT["Chat Use Cases\ncreateChat · listChats · deleteChat\nrenameChat · pinChat · searchChats"]
        UC_MSG["Message Use Cases\nsendMessage · listMessages"]
    end

    subgraph DOMAIN["Domain Layer — Core"]
        ENTITIES["Entities\nChat · Message"]
        PORTS["Port Interfaces\nIChatRepository · IMessageRepository\nIAIProvider · IDateTimeProvider · IWeatherProvider"]
    end

    subgraph SECONDARY["Infrastructure — Secondary Adapters"]
        MCR["MongoChatRepository"]
        MMR["MongoMessageRepository"]
        AI["AiSdkProvider\n(Google Gemini 2.5 Flash)"]
        TOOLS["Tool Adapters\nget_date · get_time · get_weather"]
        BA["BetterAuth Adapter"]
    end

    subgraph DI["DI Composition Root"]
        CONT["container.ts"]
    end

    B -->|"HTTP / SSE"| HONO
    HONO --> AUTH_MW --> TRPC_R --> CTX
    CTX -->|"injects"| UC_CHAT & UC_MSG
    UC_CHAT & UC_MSG -->|"operates on"| ENTITIES
    UC_CHAT & UC_MSG -->|"calls"| PORTS
    MCR & MMR & AI -->|"implements"| PORTS
    TOOLS -->|"uses"| PORTS
    CONT -->|"wires"| UC_CHAT & UC_MSG
    CONT -->|"instantiates"| MCR & MMR & AI & TOOLS & BA
```

---

## 2. Class Diagram — Domain Entities & Ports

```mermaid
classDiagram
    class Chat {
        +ObjectId _id
        +string userId
        +string title
        +boolean isPinned
        +Date createdAt
        +Date updatedAt
    }

    class Message {
        +ObjectId _id
        +string chatId
        +string userId
        +MessageRole role
        +string content
        +ToolResult[] toolResults
        +Date createdAt
    }

    class MessageRole {
        <<enumeration>>
        user
        assistant
    }

    class ToolResult {
        +string toolName
        +ToolPayload payload
    }

    class IChatRepository {
        <<interface>>
        +create(userId, title) Chat
        +findById(id) Chat
        +listByUser(userId, cursor, limit) Chat[]
        +searchByTitle(userId, query) Chat[]
        +rename(id, title) void
        +togglePin(id) void
        +delete(id) void
    }

    class IMessageRepository {
        <<interface>>
        +save(message) Message
        +findByChatId(chatId) Message[]
        +deleteByChatId(chatId) void
    }

    class IAIProvider {
        <<interface>>
        +stream(history, tools) AsyncIterable~StreamEvent~
    }

    class IDateTimeProvider {
        <<interface>>
        +getCurrentDate() string
        +getCurrentTime() string
    }

    class IWeatherProvider {
        <<interface>>
        +getWeather(location) WeatherPayload
    }

    Message --> MessageRole
    Message --> ToolResult
```

---

## 3. Class Diagram — Application Use Cases & Infrastructure Adapters

```mermaid
classDiagram
    class SendMessageUseCase {
        -IChatRepository chatRepository
        -IMessageRepository messageRepository
        -IAIProvider aiProvider
        +execute(chatId, userId, content) AsyncIterable~StreamEvent~
    }

    class CreateChatUseCase {
        -IChatRepository chatRepository
        +execute(userId, title) Chat
    }

    class ListChatsUseCase {
        -IChatRepository chatRepository
        +execute(userId, cursor, limit) Chat[]
    }

    class DeleteChatUseCase {
        -IChatRepository chatRepository
        -IMessageRepository messageRepository
        +execute(chatId, userId) void
    }

    class RenameChatUseCase {
        -IChatRepository chatRepository
        +execute(chatId, userId, title) void
    }

    class PinChatUseCase {
        -IChatRepository chatRepository
        +execute(chatId, userId) void
    }

    class SearchChatsUseCase {
        -IChatRepository chatRepository
        +execute(userId, query) Chat[]
    }

    class ListMessagesUseCase {
        -IMessageRepository messageRepository
        +execute(chatId, userId) Message[]
    }

    class MongoChatRepository {
        -Collection~Chat~ collection
        +create(userId, title) Chat
        +findById(id) Chat
        +listByUser(userId, cursor, limit) Chat[]
        +searchByTitle(userId, query) Chat[]
        +rename(id, title) void
        +togglePin(id) void
        +delete(id) void
    }

    class MongoMessageRepository {
        -Collection~Message~ collection
        +save(message) Message
        +findByChatId(chatId) Message[]
        +deleteByChatId(chatId) void
    }

    class AiSdkProvider {
        -LanguageModel model
        -Record~string Tool~ tools
        +stream(history, tools) AsyncIterable~StreamEvent~
    }

    SendMessageUseCase ..> IChatRepository
    SendMessageUseCase ..> IMessageRepository
    SendMessageUseCase ..> IAIProvider
    CreateChatUseCase ..> IChatRepository
    ListChatsUseCase ..> IChatRepository
    DeleteChatUseCase ..> IChatRepository
    DeleteChatUseCase ..> IMessageRepository
    RenameChatUseCase ..> IChatRepository
    PinChatUseCase ..> IChatRepository
    SearchChatsUseCase ..> IChatRepository
    ListMessagesUseCase ..> IMessageRepository

    MongoChatRepository ..|> IChatRepository
    MongoMessageRepository ..|> IMessageRepository
    AiSdkProvider ..|> IAIProvider
```

---

## 4. Entity-Relationship Diagram — MongoDB Collections

```mermaid
erDiagram
    USERS {
        ObjectId _id PK
        string email
        string name
        string hashedPassword
        Date createdAt
        Date updatedAt
    }

    SESSIONS {
        ObjectId _id PK
        string userId FK
        string token
        Date expiresAt
        Date createdAt
    }

    CHATS {
        ObjectId _id PK
        string userId FK
        string title
        boolean isPinned
        Date createdAt
        Date updatedAt
    }

    MESSAGES {
        ObjectId _id PK
        string chatId FK
        string userId FK
        string role
        string content
        array toolResults
        Date createdAt
    }

    USERS ||--o{ SESSIONS : "has"
    USERS ||--o{ CHATS : "owns"
    USERS ||--o{ MESSAGES : "authors"
    CHATS ||--o{ MESSAGES : "contains"
```

---

## 5. Sequence Diagram — Authentication (SSR)

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant QueryClient as React Query Cache
    participant Server as Hono Server (SSR)
    participant BetterAuth
    participant MongoDB

    User->>Browser: navigate to /auth
    Browser->>Server: GET /auth
    Server->>BetterAuth: validateSession(cookie)
    BetterAuth-->>Server: no active session
    Server-->>Browser: render /auth (pre-rendered HTML, dark theme)

    Note over Browser: Client hydrates — TanStack Router takes over

    User->>Browser: fill login form (email + password)
    Browser->>Browser: TanStack Form validates via Zod schema
    User->>Browser: submit

    Browser->>BetterAuth: signIn.email({ email, password })
    BetterAuth->>MongoDB: lookup user + verify password
    MongoDB-->>BetterAuth: user found
    BetterAuth->>MongoDB: insert session document
    MongoDB-->>BetterAuth: session created
    BetterAuth-->>Browser: Set-Cookie: session=token

    Browser->>QueryClient: queryClient.clear()
    Note over QueryClient: Stale data from any previous account is removed

    Browser->>Browser: navigate to /chat

    Note over User, MongoDB: Logout flow
    User->>Browser: click Logout button (sidebar)
    Browser->>BetterAuth: signOut()
    BetterAuth->>MongoDB: revoke session
    Browser->>QueryClient: queryClient.clear()
    Note over QueryClient: Cache wiped — next login starts fresh
    Browser->>Browser: navigate to /auth
```

---

## 6. Sequence Diagram — Send Message & AI Streaming (CSR)

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant SSE as POST /api/stream
    participant UC as SendMessageUseCase
    participant MsgRepo as MongoMessageRepository
    participant AI as AiSdkProvider
    participant AISDK as Vercel AI SDK (streamText)
    participant Tools as Tool Adapters

    User->>Browser: type message and submit
    Browser->>SSE: POST /api/stream { chatId, content }
    SSE->>UC: execute(chatId, userId, content)

    UC->>MsgRepo: save(userMessage)
    MsgRepo-->>UC: persisted

    UC->>AI: stream(messageHistory)
    AI->>AISDK: streamText({ model: Gemini 2.5 Flash, system, messages, tools, maxSteps: 5 })

    loop Text deltas (fullStream)
        AISDK-->>AI: TextDeltaPart { type: "text-delta", textDelta }
        AI-->>UC: StreamEvent { type: "text", delta }
        UC-->>SSE: yield event
        SSE-->>Browser: SSE chunk
        Browser->>Browser: append delta to StreamingMessage bubble
    end

    opt Tool call (within fullStream steps)
        AISDK->>Tools: execute get_date / get_time / get_weather
        Tools-->>AISDK: typed ToolPayload
        Note over AISDK: Tool result feeds next step context
    end

    Note over AI: fullStream exhausted — collect tool results from steps
    loop Tool results (post-stream)
        AI-->>UC: StreamEvent { type: "tool_result", toolName, payload }
        UC-->>SSE: yield event
        SSE-->>Browser: SSE chunk
        Browser->>Browser: ToolResultModal opens automatically
        Browser->>Browser: tool button (🔧 toolName) rendered below AI text
    end

    AISDK-->>AI: stream complete
    UC->>MsgRepo: save(assistantMessage { content, toolResults })
    MsgRepo-->>UC: persisted
    SSE-->>Browser: SSE [DONE]
    Browser->>Browser: invalidate message list query
    Browser->>Browser: StreamingMessage unmounts → MessageBubble rendered
```

---

## 7. Sequence Diagram — Chat Management

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant tRPC as tRPC Procedure
    participant UC as Chat Use Case
    participant Repo as MongoChatRepository

    Note over User, Repo: Create Chat
    User->>Browser: click "+ New Chat"
    Browser->>tRPC: chat.create({ title })
    tRPC->>UC: CreateChatUseCase.execute(userId, title)
    UC->>Repo: create(userId, title)
    Repo-->>UC: Chat
    tRPC-->>Browser: Chat
    Browser->>Browser: write chatId to URL, load conversation

    Note over User, Repo: Rename Chat
    User->>Browser: click ✏️ icon, edit title inline, press Enter
    Browser->>tRPC: chat.rename({ chatId, title })
    tRPC->>UC: RenameChatUseCase.execute(chatId, userId, title)
    UC->>Repo: rename(chatId, title)
    Repo-->>UC: ok
    Browser->>Browser: TanStack Query invalidates chat list

    Note over User, Repo: Pin / Unpin Chat
    User->>Browser: click 📌 icon
    Browser->>Browser: optimistic update (isPinned toggled in cache)
    Browser->>tRPC: chat.togglePin({ chatId })
    tRPC->>UC: PinChatUseCase.execute(chatId, userId)
    UC->>Repo: togglePin(chatId)
    Repo-->>UC: ok
    Browser->>Browser: sidebar re-sorts (pinned first)

    Note over User, Repo: Delete Chat (two-step confirm)
    User->>Browser: click 🗑️ icon (first click — shows ✓ button, stays visible)
    User->>Browser: click ✓ icon (second click — confirms deletion)
    Browser->>tRPC: chat.delete({ chatId })
    tRPC->>UC: DeleteChatUseCase.execute(chatId, userId)
    UC->>Repo: findById(chatId) — verify ownership
    UC->>Repo: deleteByChatId(chatId) — remove messages
    UC->>Repo: delete(chatId) — remove chat
    Repo-->>UC: ok
    Browser->>Browser: redirect if active chat deleted, invalidate list

    Note over User, Repo: Search Chats
    User->>Browser: type in search input
    Browser->>Browser: write query to URL param ?q=
    Browser->>tRPC: chat.search({ query })
    tRPC->>UC: SearchChatsUseCase.execute(userId, query)
    UC->>Repo: searchByTitle(userId, query)
    Repo-->>UC: Chat[] from MongoDB text index
    tRPC-->>Browser: Chat[]
    Browser->>Browser: render filtered sidebar list
```

---

## 8. Component Tree — Frontend

```mermaid
graph TD
    APP["App\n(TanStack Start — React 19)"]

    APP --> AUTH_PAGE["/auth page\n(SSR)"]
    APP --> CHAT_PAGE["/chat page\n(SSR shell + CSR hydration)"]

    AUTH_PAGE --> AUTH_TABS["AuthTabs\n(register / login tabs)"]
    AUTH_TABS --> REGISTER_FORM["RegisterForm\n(TanStack Form + Zod)"]
    AUTH_TABS --> LOGIN_FORM["LoginForm\n(TanStack Form + Zod)\nqueryClient.clear() on success"]

    CHAT_PAGE --> SIDEBAR["Sidebar"]
    CHAT_PAGE --> CONVERSATION["Conversation\n(manages stream state)"]

    SIDEBAR --> SEARCH_INPUT["SearchInput\n(debounced, URL param ?q)"]
    SIDEBAR --> CHAT_LIST["ChatList\n(useInfiniteQuery + IntersectionObserver)"]
    CHAT_LIST --> CHAT_ITEM["ChatItem\n(📌 pin · ✏️ rename · 🗑️ delete — 2-step confirm)"]
    SIDEBAR --> LOGOUT_BTN["Logout Button\nqueryClient.clear() + signOut()"]

    CONVERSATION --> MESSAGE_LIST["MessageList"]
    CONVERSATION --> MESSAGE_INPUT["MessageInput\n(submit triggers SSE stream)"]

    MESSAGE_LIST --> MSG_BUBBLE["MessageBubble\n(persisted messages)"]
    MESSAGE_LIST --> STREAMING_MSG["StreamingMessage\n(live during SSE — CSR only)"]

    MSG_BUBBLE --> TOOL_BTN["🔧 toolName button\n(per tool result)"]
    TOOL_BTN --> MODAL_SAVED["ToolResultModal\n(open on click)"]

    STREAMING_MSG --> MODAL_STREAM["ToolResultModal\n(auto-open on tool_result event)"]

    MODAL_SAVED --> TOOL_RESULT_CARD["ToolResultCard\n(dispatches by toolName)"]
    MODAL_STREAM --> TOOL_RESULT_CARD

    TOOL_RESULT_CARD --> DATE_CARD["DateCard"]
    TOOL_RESULT_CARD --> TIME_CARD["TimeCard"]
    TOOL_RESULT_CARD --> WEATHER_CARD["WeatherCard"]
```

---

## 9. Flowchart — Rendering Strategy (SSR vs CSR)

```mermaid
flowchart TD
    REQ["Incoming Request"]

    REQ --> IS_AUTH{Route is /auth?}

    IS_AUTH -->|Yes| CHECK_SESSION["Server validates session\n(BetterAuth SSR)"]
    CHECK_SESSION --> HAS_SESSION{Active session?}
    HAS_SESSION -->|Yes| REDIRECT["Redirect to /chat\n(server-side)"]
    HAS_SESSION -->|No| RENDER_AUTH["Server renders /auth\n(SSR — pre-rendered HTML)"]
    RENDER_AUTH --> HYDRATE_AUTH["Client hydrates\nTanStack Form activates (CSR)"]

    IS_AUTH -->|No — /chat| PREFETCH["Server prefetches\nchat list + messages\n(TanStack Start server loader — SSR)"]
    PREFETCH --> HYDRATE_CHAT["Client hydrates\nTanStack Query populated (CSR)"]
    HYDRATE_CHAT --> USER_ACTION{User action?}

    USER_ACTION -->|"Navigate / search / manage"| CSR_QUERY["TanStack Query\nmutation or query (CSR)"]
    USER_ACTION -->|"Send message"| STREAM["SSE stream\n(CSR only — ReadableStream)"]
    STREAM --> RENDER_TEXT["StreamingMessage renders\ntext deltas live"]
    RENDER_TEXT --> TOOL_EVENT{tool_result event?}
    TOOL_EVENT -->|Yes| OPEN_MODAL["ToolResultModal opens automatically\ntext stays in chat bubble\ntool data shown in popup"]
    TOOL_EVENT -->|No| STREAM_END["Stream ends\nMessageBubble renders persisted message"]
    OPEN_MODAL --> STREAM_END
```

---

## 10. Flowchart — Adding a New Tool

```mermaid
flowchart LR
    STEP1["1. Define port interface\ndomain/ports/\nnew-provider.port.ts"] -->
    STEP2["2. Implement tool adapter\ninfrastructure/tools/\nget-new-data.tool.ts\n(receives INewProvider via constructor)"] -->
    STEP3["3. Implement external provider\ninfrastructure/\nNewProviderImpl implements INewProvider"] -->
    STEP4["4. Wire in composition root\ninfrastructure/container.ts\ninject NewProviderImpl into tool"] -->
    STEP5["5. Register in tool barrel\ninfrastructure/tools/index.ts"] -->
    STEP6["6. Add UI card component\napps/web/components/conversation/tools/\nNewDataCard.tsx"] -->
    STEP7["7. Register card in registry\nToolResultCard.tsx\nadd toolName → NewDataCard mapping"]
```

---

