## Context

The backend (tRPC chat procedures, MongoDB repositories, use cases) is fully implemented. The `/chat` route does not exist yet in the frontend; the `routeTree.gen.ts` only has `__root__` and `/auth`. The tRPC client (`~/lib/trpc`) and auth client are available. HeroUI v3 (compound component API), TanStack Router, and TanStack Query are all installed.

## Goals / Non-Goals

**Goals:**
- SSR initial load: TanStack Router loader pre-fetches first page of chats server-side, hydrates TanStack Query on client
- Paginated, infinite-scrolling chat list sorted by `updatedAt` desc with pinned chats always first
- Debounced search synced to URL param `q`; replaces the paginated list with search results while `q` is active
- ChatItem actions: pin toggle (optimistic update), inline rename (confirm on Enter/blur), delete (confirmation before mutation)
- "New Chat" button: creates a chat, writes `chatId` to URL
- Active `chatId` lives in URL search params

**Non-Goals:**
- The conversation panel (MessageList, MessageInput, streaming) — step 13
- Offline support, drag-to-reorder, multi-select

## Decisions

### D1: URL State for chatId and q

Both `chatId` and `q` go into URL search params (`?chatId=...&q=...`). This follows the requirements constraint and enables direct linking. TanStack Router's `validateSearch` option with Zod is used to parse and type the search params.

### D2: Server loader pre-fetches only the chat list (not messages)

The SSR loader fetches the first page of chats (via the tRPC caller or a direct use-case call). Messages are step 13. Pre-fetching the list on SSR means zero loading flash on first paint for the sidebar.

### D3: useInfiniteQuery cursor strategy

`chats.list` uses cursor-based pagination (`cursor?: string`, returns `{ items, nextCursor }`). The cursor is the `_id` of the last item. `useInfiniteQuery` loads the next page when the user scrolls near the bottom (IntersectionObserver on a sentinel element). When `q` is non-empty, `chats.search` is used instead (returns all matches, no pagination needed for search).

### D4: Pinned-first sort on the client

The backend returns chats sorted by `updatedAt` desc. Pinned chats are sorted first by the client-side selector that maps over the `useInfiniteQuery` pages — `[...pinned, ...unpinned]` — so re-sorting after a pin toggle is instant and requires no refetch. Optimistic updates handle the toggle UI immediately.

### D5: Inline rename

On clicking the rename action, the `ChatItem` switches the title `<span>` to an `<input>` controlled by local state. Submitting (Enter or blur) fires `chats.rename`. On success TanStack Query invalidates the list. On escape, the edit is cancelled.

### D6: Delete confirmation

A simple window `confirm()` or a local `isDeleting` state with a two-step click ("Delete" → "Confirm delete") — no modal component needed for now. Keeps the implementation minimal.

### D7: No optimistic update on rename or delete

Rename and delete are low-frequency actions where correctness matters more than latency. A loading spinner on the ChatItem row is enough feedback. Pin toggle is the one action that benefits from optimistic update because users expect instantaneous re-sorting.

## Risks / Trade-offs

- **Route tree regeneration**: `routeTree.gen.ts` must be manually updated (or the build run) before typecheck passes. The `/chat` route is new and the generator only runs during `vinxi build`/`vinxi dev`. → Mitigation: manually update `routeTree.gen.ts` as part of the tasks, same approach used in step 11 for `/auth`.

- **tRPC server-side caller in SSR loader**: TanStack Start's server loaders run on the server; calling tRPC from there requires a server-side caller (not the browser `trpcClient`). → Mitigation: use `trpc.createCallerFactory` or a direct use-case call via the container. The simpler path is to call the use case directly from the loader (bypassing tRPC) using `createServerFn` from `@tanstack/start`.

- **Pinned-first sort + infinite scroll**: If pages are already loaded and a pin happens, the flat sorted list must be re-derived from cached data. The client-side sort on all loaded pages handles this without a refetch. → Trade-off: sort is purely client-side and only applies to the already-loaded data; a full refresh would re-sort server-side too.

## Open Questions

- None — all decisions above are sufficient to proceed to implementation.
