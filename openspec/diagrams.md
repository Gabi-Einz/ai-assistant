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
        AI["AiSdkProvider"]
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
    }

    class AiSdkProvider {
        -LanguageModel model
        -ToolRegistry tools
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
    participant Server as Hono Server (SSR)
    participant BetterAuth
    participant MongoDB

    User->>Browser: navigate to /auth
    Browser->>Server: GET /auth
    Server->>BetterAuth: validateSession(cookie)
    BetterAuth-->>Server: no active session
    Server-->>Browser: render /auth (pre-rendered HTML, dark theme)

    Note over Browser: Client hydrates — TanStack Router takes over

    User->>Browser: fill register form (email + password)
    Browser->>Browser: TanStack Form validates via Zod schema
    User->>Browser: submit

    Browser->>Server: tRPC mutation — auth.register({ email, password })
    Server->>BetterAuth: register(email, password)
    BetterAuth->>MongoDB: insert user document
    MongoDB-->>BetterAuth: user created
    BetterAuth->>MongoDB: insert session document
    MongoDB-->>BetterAuth: session created
    BetterAuth-->>Server: session token
    Server-->>Browser: Set-Cookie: session=token
    Browser->>Browser: redirect to /chat (client-side)
```

---

## 6. Sequence Diagram — Send Message & AI Streaming (CSR)

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant tRPC as tRPC Procedure
    participant UC as SendMessageUseCase
    participant MsgRepo as MongoMessageRepository
    participant AI as AiSdkProvider
    participant AISDK as AI SDK (streamText)
    participant Tools as Tool Adapters

    User->>Browser: type message and submit
    Browser->>Browser: TanStack Query mutation triggered (CSR)
    Browser->>tRPC: messages.send({ chatId, content })
    tRPC->>UC: execute(chatId, userId, content)

    UC->>MsgRepo: save(userMessage)
    MsgRepo-->>UC: message persisted

    UC->>AI: stream(messageHistory, toolRegistry)
    AI->>AISDK: streamText({ model, messages, tools })

    loop Streaming deltas
        AISDK-->>AI: text delta
        AI-->>UC: StreamEvent { type: "text", delta }
        UC-->>tRPC: yield StreamEvent
        tRPC-->>Browser: SSE chunk
        Browser->>Browser: append delta to message UI
    end

    opt Tool call detected
        AISDK->>Tools: execute tool (get_date / get_time / get_weather)
        Tools-->>AISDK: typed ToolPayload
        AISDK-->>AI: StreamEvent { type: "tool_result", toolName, payload }
        AI-->>UC: yield StreamEvent
        UC-->>tRPC: yield StreamEvent
        tRPC-->>Browser: SSE chunk (tool result)
        Browser->>Browser: render dedicated ToolResultCard component
    end

    AISDK-->>AI: stream end
    AI-->>UC: stream complete
    UC->>MsgRepo: save(assistantMessage with toolResults)
    MsgRepo-->>UC: persisted
    UC-->>tRPC: stream closed
    tRPC-->>Browser: SSE closed
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
    User->>Browser: click "New Chat"
    Browser->>tRPC: chats.create({ title })
    tRPC->>UC: CreateChatUseCase.execute(userId, title)
    UC->>Repo: create(userId, title)
    Repo-->>UC: Chat
    UC-->>tRPC: Chat
    tRPC-->>Browser: Chat
    Browser->>Browser: write chatId to URL, load conversation

    Note over User, Repo: Rename Chat
    User->>Browser: inline edit title and confirm
    Browser->>tRPC: chats.rename({ chatId, title })
    tRPC->>UC: RenameChatUseCase.execute(chatId, userId, title)
    UC->>Repo: rename(chatId, title)
    Repo-->>UC: ok
    Browser->>Browser: TanStack Query invalidates chat list

    Note over User, Repo: Pin / Unpin Chat
    User->>Browser: click pin icon
    Browser->>tRPC: chats.togglePin({ chatId })
    tRPC->>UC: PinChatUseCase.execute(chatId, userId)
    UC->>Repo: togglePin(chatId)
    Repo-->>UC: ok
    Browser->>Browser: sidebar re-sorts (pinned first)

    Note over User, Repo: Delete Chat
    User->>Browser: click delete and confirm
    Browser->>tRPC: chats.delete({ chatId })
    tRPC->>UC: DeleteChatUseCase.execute(chatId, userId)
    UC->>Repo: delete(chatId) and deleteMessagesByChatId(chatId)
    Repo-->>UC: ok
    Browser->>Browser: redirect if active chat deleted, invalidate list

    Note over User, Repo: Search Chats
    User->>Browser: type in search input
    Browser->>Browser: debounce, write query to URL param ?q=
    Browser->>tRPC: chats.search({ query })
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
    AUTH_TABS --> LOGIN_FORM["LoginForm\n(TanStack Form + Zod)"]

    CHAT_PAGE --> SIDEBAR["Sidebar"]
    CHAT_PAGE --> CONVERSATION["Conversation"]

    SIDEBAR --> SEARCH_INPUT["SearchInput\n(debounced, URL param q)"]
    SIDEBAR --> CHAT_LIST["ChatList\n(useInfiniteQuery)"]
    CHAT_LIST --> CHAT_ITEM["ChatItem\n(title · pin · rename · delete)"]

    CONVERSATION --> MESSAGE_LIST["MessageList"]
    CONVERSATION --> MESSAGE_INPUT["MessageInput\n(submit triggers SSE stream)"]

    MESSAGE_LIST --> TEXT_MESSAGE["TextMessage\n(streaming delta render — CSR only)"]
    MESSAGE_LIST --> TOOL_RESULT_CARD["ToolResultCard\n(dispatches by toolName — CSR only)"]

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
    STREAM --> RENDER_STREAM["Render text deltas\n+ ToolResultCard\n(client-only, never SSR)"]
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
    STEP6["6. Add UI component\napps/web/\nNewDataCard.tsx\nregister in toolName to UIComponent map"]
```

---

## 11. DI Wiring — Composition Root

```mermaid
flowchart TB
    subgraph CONTAINER["container.ts — Composition Root"]
        direction TB
        DB["MongoDB db handle"] --> MCR["MongoChatRepository"]
        DB --> MMR["MongoMessageRepository"]
        AISDK_CLIENT["AI SDK model client"] --> AI["AiSdkProvider"]
        DT["System Clock"] --> DTP["DateTimeProvider"]
        WEATHER_API["Weather API client"] --> WP["WeatherProvider"]

        DTP & WP --> TOOLS["Tool Adapters\nget_date · get_time · get_weather"]

        MCR & MMR & AI --> SM["SendMessageUseCase"]
        MCR --> CC["CreateChatUseCase"]
        MCR --> LC["ListChatsUseCase"]
        MCR & MMR --> DC["DeleteChatUseCase"]
        MCR --> RC["RenameChatUseCase"]
        MCR --> PC["PinChatUseCase"]
        MCR --> SC["SearchChatsUseCase"]
        MMR --> LM["ListMessagesUseCase"]
    end

    CONTAINER -->|"attached per request"| CTX["tRPC Context\n(context.ts)"]
    CTX -->|"consumed by"| PROC["tRPC Procedures"]
```
