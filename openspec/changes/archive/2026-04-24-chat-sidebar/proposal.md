## Why

The `/chat` route needs a functional sidebar so users can navigate between conversations and manage them. Without the sidebar, authenticated users have no way to access past chats, create new ones, or search across their history.

## What Changes

- Create `apps/web/app/routes/chat.tsx` (or `chat/index.tsx`) — the `/chat` SSR shell with a TanStack Router loader that pre-fetches the first page of chats server-side
- Create `apps/web/app/components/sidebar/Sidebar.tsx` — layout wrapper with a "New Chat" button
- Create `apps/web/app/components/sidebar/SearchInput.tsx` — debounced text input synced to URL param `q`
- Create `apps/web/app/components/sidebar/ChatList.tsx` — infinite scroll list using `useInfiniteQuery`; shows search results when `q` is set, otherwise paginated list; pinned chats always sort first
- Create `apps/web/app/components/sidebar/ChatItem.tsx` — single row: title, pin toggle, inline rename, delete with confirmation dialog
- Update `routeTree.gen.ts` to include `/chat` route (so typecheck resolves)
- Wire tRPC procedures: `chats.list` (cursor-based), `chats.search`, `chats.create`, `chats.rename`, `chats.togglePin`, `chats.delete`

## Capabilities

### New Capabilities

- `chat-sidebar-ui`: Frontend sidebar — ChatList with infinite scroll, SearchInput with debounced URL param, ChatItem with pin/rename/delete actions, integrated with tRPC chat procedures

### Modified Capabilities

<!-- No existing spec-level requirements change — all backend use cases and tRPC procedures are already defined -->

## Impact

- **Frontend only** — no backend changes
- Depends on tRPC chat procedures (`chats.*`) already implemented in `apps/api`
- Depends on `ChatDto` types from `packages/shared`
- Depends on `trpc` client from `apps/web/app/lib/trpc.ts`
- URL search param `q` and URL param `chatId` added to the `/chat` route
- `/chat` becomes a real route in the TanStack Router tree (currently only `__root__` and `/auth` are registered)
