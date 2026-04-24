## ADDED Requirements

### Requirement: Chat route with SSR pre-fetch

The `/chat` route SHALL be an SSR route that pre-fetches the first page of the user's chats server-side before the first byte is sent. If no valid session exists, the loader SHALL redirect to `/auth`. The pre-fetched data SHALL be used to hydrate TanStack Query on the client so the sidebar renders immediately without a loading state on first paint.

#### Scenario: Authenticated user loads /chat

- **WHEN** an authenticated user navigates to `/chat`
- **THEN** the server pre-fetches the first page of the user's chats
- **THEN** the page is rendered with sidebar data already populated (no loading spinner on first paint)

#### Scenario: Unauthenticated user loads /chat

- **WHEN** an unauthenticated user navigates to `/chat`
- **THEN** the server redirects to `/auth` before any HTML is sent

---

### Requirement: Chat list with infinite scroll

The sidebar SHALL display the user's chats sorted by `updatedAt` desc with pinned chats always appearing first. The list SHALL use cursor-based pagination via `useInfiniteQuery`. When the user scrolls near the bottom of the list, the next page SHALL be loaded automatically.

#### Scenario: Initial chat list renders

- **WHEN** the sidebar mounts
- **THEN** it displays the first page of chats (pinned first, then by `updatedAt` desc)

#### Scenario: User scrolls to bottom of list

- **WHEN** the user scrolls to within the last item of the loaded list
- **THEN** the next page of chats is fetched and appended to the list

#### Scenario: No chats exist

- **WHEN** the user has no chats
- **THEN** the sidebar displays an empty state message

---

### Requirement: Search input with debounced URL sync

The sidebar SHALL include a text input that filters the chat list by title. The search query SHALL be written to the URL search param `q` after a debounce of at least 300ms. When `q` is non-empty, the list SHALL show results from `chats.search` instead of the paginated list. When `q` is cleared, the paginated list SHALL be restored.

#### Scenario: User types in search input

- **WHEN** the user types in the search input and stops typing for 300ms or more
- **THEN** the URL param `q` is updated and the sidebar shows filtered results

#### Scenario: User clears search input

- **WHEN** the user clears the search input
- **THEN** the URL param `q` is removed and the paginated list is restored

#### Scenario: Search returns no results

- **WHEN** the search query matches no chats
- **THEN** the sidebar displays an empty search results message

---

### Requirement: Create new chat

The sidebar SHALL include a "New Chat" button. Clicking it SHALL call `chats.create`, then write the new `chatId` to the URL search param `chatId`.

#### Scenario: User clicks New Chat

- **WHEN** the user clicks the "New Chat" button
- **THEN** a new chat is created and its `chatId` is written to the URL

---

### Requirement: Active chat selection

Clicking a `ChatItem` SHALL write that chat's `chatId` to the URL search param `chatId`. The active chat SHALL be visually distinguished.

#### Scenario: User selects a chat

- **WHEN** the user clicks a chat in the sidebar
- **THEN** the `chatId` URL param is updated to that chat's id
- **THEN** the selected chat is visually highlighted

---

### Requirement: Pin / unpin chat

Each `ChatItem` SHALL include a pin toggle. Toggling pin SHALL call `chats.togglePin` and optimistically re-sort the sidebar so pinned chats appear first without waiting for a refetch.

#### Scenario: User pins an unpinned chat

- **WHEN** the user clicks the pin icon on an unpinned chat
- **THEN** the chat moves to the top of the list immediately (optimistic)
- **THEN** `chats.togglePin` is called and the list is invalidated on success

#### Scenario: User unpins a pinned chat

- **WHEN** the user clicks the pin icon on a pinned chat
- **THEN** the chat moves out of the pinned section immediately (optimistic)
- **THEN** `chats.togglePin` is called and the list is invalidated on success

---

### Requirement: Rename chat inline

Each `ChatItem` SHALL support inline renaming. Clicking the rename action SHALL replace the title with an editable input. Pressing Enter or blurring the input SHALL commit the rename via `chats.rename`. Pressing Escape SHALL cancel without saving.

#### Scenario: User renames a chat

- **WHEN** the user activates the rename action and types a new title and presses Enter
- **THEN** `chats.rename` is called with the new title
- **THEN** the title updates in the sidebar on success

#### Scenario: User cancels rename

- **WHEN** the user activates rename and presses Escape
- **THEN** the original title is restored without any mutation

---

### Requirement: Delete chat with confirmation

Each `ChatItem` SHALL include a delete action. Clicking delete SHALL require a confirmation step before calling `chats.delete`. After deletion, if the deleted chat was the active chat (current `chatId`), the `chatId` URL param SHALL be cleared.

#### Scenario: User deletes an inactive chat

- **WHEN** the user confirms deletion of a chat that is not the active chat
- **THEN** `chats.delete` is called
- **THEN** the chat is removed from the sidebar list

#### Scenario: User deletes the active chat

- **WHEN** the user confirms deletion of the currently active chat
- **THEN** `chats.delete` is called
- **THEN** the `chatId` URL param is cleared
- **THEN** the sidebar list refreshes without the deleted chat
