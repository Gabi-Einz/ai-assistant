## 1. Route Setup

- [x] 1.1 Create `apps/web/app/routes/chat.tsx` — define `Route` with `createFileRoute('/chat')`, add `validateSearch` with Zod schema `z.object({ chatId: z.string().optional(), q: z.string().optional() })`; add `beforeLoad` that calls `authClient.getSession()`, redirecting to `/auth` if no session; add a `loader` that uses `createServerFn` to pre-fetch the first page of chats server-side and prefetchQuery into the queryClient; render `<ChatPage />` component with `<Sidebar />` placeholder and a conversation area placeholder
- [x] 1.2 Update `apps/web/app/routeTree.gen.ts` manually to include `/chat` route (same pattern used for `/auth` in step 11) so typecheck resolves `createFileRoute('/chat')`

## 2. Sidebar Layout

- [x] 2.1 Create `apps/web/app/components/sidebar/Sidebar.tsx` — layout component with a "New Chat" button at the top; the button calls `trpc.chats.create.useMutation` with title `"New Chat"`, on success navigates to `?chatId=<newId>`; renders `<SearchInput />` and `<ChatList />`

## 3. SearchInput

- [x] 3.1 Create `apps/web/app/components/sidebar/SearchInput.tsx` — controlled input with local state; uses `useDebounce` (inline implementation: `useEffect` + `setTimeout` 300ms) to write the debounced value to the `q` URL search param via `useNavigate({ search: (prev) => ({ ...prev, q: debounced || undefined }) })`; clears `q` when input is empty

## 4. ChatList

- [x] 4.1 Create `apps/web/app/components/sidebar/ChatList.tsx` — uses `trpc.chats.list.useInfiniteQuery` when `q` is empty (cursor derived from last item `_id`; `getNextPageParam: (lastPage) => lastPage.length === 20 ? lastPage[lastPage.length - 1]._id : undefined`); uses `trpc.chats.search.useQuery({ query: q }, { enabled: !!q })` when `q` is set; client-sorts all loaded items pinned-first then by `updatedAt` desc; renders a list of `<ChatItem>` and a sentinel `<div ref={sentinelRef}>` at the bottom; uses `IntersectionObserver` on the sentinel to call `fetchNextPage` when visible and `hasNextPage` is true; shows empty state when no items

## 5. ChatItem

- [x] 5.1 Create `apps/web/app/components/sidebar/ChatItem.tsx` — receives a `ChatDto`; highlights as active when `chat._id === searchParams.chatId`; clicking the row navigates to `?chatId=<id>`
- [x] 5.2 Add pin toggle to `ChatItem` — pin button calls `trpc.chats.togglePin.useMutation`; uses `useQueryClient().setQueriesData` for optimistic update (flip `isPinned`, re-sort); on error, rolls back via `onError` → `queryClient.setQueriesData` with previous data
- [x] 5.3 Add inline rename to `ChatItem` — rename action toggles `isEditing` local state; renders `<input>` prefilled with current title; `onKeyDown` Enter commits via `trpc.chats.rename.useMutation`; `onBlur` also commits; Escape cancels; on success invalidates `trpc.chats.list` and `trpc.chats.search` query keys
- [x] 5.4 Add delete to `ChatItem` — delete action sets `isConfirming` local state (two-step: "Delete" → "Confirm?"); on confirm calls `trpc.chats.delete.useMutation`; on success: if `chat._id === searchParams.chatId` navigate to `/chat` (clear chatId), then invalidate chat list queries

## 6. Wire Chat Route Component

- [x] 6.1 Update `apps/web/app/routes/chat.tsx` `<ChatPage>` component — import and render `<Sidebar />` inside a two-column layout (`flex h-screen`); add a right-panel placeholder `<div className="flex-1">` for the conversation area (step 13)

## 7. Type Check & Build

- [x] 7.1 Run `pnpm --filter @repo/web typecheck` and fix any type errors
- [x] 7.2 Run `pnpm --filter @repo/web build` and confirm successful build
