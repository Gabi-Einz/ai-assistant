## Why

The backend needs a stable, framework-free domain core before any application logic or infrastructure adapters can be built. Without typed entities, port interfaces, and domain errors, every outer layer would be forced to import concrete implementations — violating the Dependency Rule and making the system untestable.

## What Changes

- `apps/api/src/domain/entities/chat.entity.ts` — Chat aggregate typed as a plain TypeScript interface with no framework imports
- `apps/api/src/domain/entities/message.entity.ts` — Message aggregate including `MessageRole`, `ToolResult`, and a reference to `ToolPayload` from `@repo/shared`
- `apps/api/src/domain/ports/chat-repository.port.ts` — `IChatRepository` interface: create, findById, listByUser (cursor-based), searchByTitle, rename, togglePin, delete
- `apps/api/src/domain/ports/message-repository.port.ts` — `IMessageRepository` interface: save, findByChatId
- `apps/api/src/domain/ports/ai-provider.port.ts` — `IAIProvider` interface: stream (yields `AsyncIterable<StreamEvent>`)
- `apps/api/src/domain/ports/datetime-provider.port.ts` — `IDateTimeProvider` interface: getCurrentDate, getCurrentTime
- `apps/api/src/domain/ports/weather-provider.port.ts` — `IWeatherProvider` interface: getWeather
- `apps/api/src/domain/errors/chat-not-found.error.ts` — typed domain error for missing chat
- `apps/api/src/domain/errors/unauthorized.error.ts` — typed domain error for ownership violations

## Capabilities

### New Capabilities
- `backend-entities`: Pure TypeScript entity interfaces for Chat and Message aggregates with zero framework dependencies
- `backend-ports`: Port interfaces (IChatRepository, IMessageRepository, IAIProvider, IDateTimeProvider, IWeatherProvider) that define the boundary between domain and infrastructure
- `backend-domain-errors`: Typed domain error classes for ChatNotFound and Unauthorized scenarios

### Modified Capabilities

## Impact

- All files are in `apps/api/src/domain/` — no other app directories touched
- Depends on `@repo/shared` types (`ToolPayload`, `StreamEvent`, `Message` shapes) already defined in step 2
- All application use cases (step 4) and infrastructure adapters (step 5) will import from this layer
- No runtime dependencies introduced — pure TypeScript types and error classes only
