~~1  Monorepo bootstrap — pnpm workspace, Turborepo config, tsconfig base compartido, estructura de apps/ y packages/~~ ✓ completado
~~2  packages/shared — Zod schemas de tool payloads, tipos tRPC compartidos, tipos de entidades (Chat, Message) sin dependencias de framework~~ ✓ completado
~~3  Backend · Domain layer — entidades (chat.entity.ts, message.entity.ts), port interfaces (IChatRepository, IMessageRepository, IAIProvider, IDateTimeProvider, IWeatherProvider), domain errors~~ ✓ completado
~~4  Backend · Application layer — use cases con constructor injection tipado a port interfaces, DTOs de entrada/salida~~ ✓ completado
~~5  Backend · Infrastructure — repositories MongoDB (MongoChatRepository, MongoMessageRepository), providers (AiSdkProvider, DateTimeProvider, WeatherProvider), tool adapters (get_date, get_time, get_weather), conexión MongoDB + creación de índices al startup~~ ✓ completado
~~6  Backend · DI composition root — container.ts: wiring completo de adapters → use cases; context.ts: attach de use cases al contexto tRPC por request~~ ✓ completado
7  Backend · Primary adapters — Hono app factory, tRPC routers (chat.router.ts, message.router.ts), auth middleware (BetterAuth server setup)
8  Backend · Streaming SSE — endpoint SSE en Hono conectado a IAIProvider.stream(), propagación de StreamEvents (text delta + tool_result) al cliente via ReadableStream
9  Variables de entorno — schema validado con Zod (MONGODB_URI, AI_API_KEY, WEATHER_API_KEY, BETTERAUTH_SECRET), archivos .env.example para cada app
10 Frontend · SSR setup — configurar adaptador SSR de TanStack Router (Vinxi/Vite SSR), BetterAuth client, hidratación de TanStack Query con datos pre-fetcheados del servidor
11 Frontend · /auth — RegisterForm y LoginForm con TanStack Form + Zod, validación field-level, redirect server-side si sesión activa, redirect client-side al /chat on success
12 Frontend · /chat sidebar — ChatList con useInfiniteQuery y cursor-based pagination, SearchInput debounced con URL param q, ChatItem con acciones pin/rename/delete, re-sort pinned first
13 Frontend · /chat conversation — MessageList, MessageInput, render incremental de streaming deltas, registro toolName → UIComponent (DateCard, TimeCard, WeatherCard), indicador de tool usada, estados empty/loading/error
14 Tests — bun:test para unit tests de use cases (mocks de port interfaces), @hono/testing + bun:test para integration tests del API; apuntar al máximo coverage posible
15 Docker y deploy — Dockerfile multi-stage para apps/api (Bun), docker-compose.yml con MongoDB + API para local dev, vercel.json para apps/web
16 README — instrucciones de setup, arquitectura elegida, decisiones técnicas, workflow con IA, prompts utilizados, modelos utilizados, qué mejorarías con más tiempo
