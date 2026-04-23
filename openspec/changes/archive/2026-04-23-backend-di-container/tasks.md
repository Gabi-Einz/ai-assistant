## 1. Composition Root

- [x] 1.1 Create `apps/api/src/infrastructure/container.ts` exporting `initContainer(db: Db): Promise<Container>` — instantiate `MongoChatRepository`, `MongoMessageRepository`, `DateTimeProvider`, `WeatherProvider`, `buildTools`, `createAnthropic('claude-haiku-4-5')` model, `AiSdkProvider`, then all 8 use cases; export `type Container = Awaited<ReturnType<typeof initContainer>>`

## 2. tRPC Context

- [x] 2.1 Create `apps/api/src/infrastructure/trpc/context.ts` exporting `interface AppContext` (all 8 use cases + `userId: string | null`) and `createContextFactory(container: Container)` returning `createContext({ req: Request }): AppContext` that spreads use cases and sets `userId: null`

## 3. Type Check

- [x] 3.1 Run `cd apps/api && pnpm exec tsc --noEmit` and confirm zero type errors
