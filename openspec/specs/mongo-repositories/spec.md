## ADDED Requirements

### Requirement: MongoChatRepository implements IChatRepository with ObjectId boundary conversion
`apps/api/src/infrastructure/repositories/mongo-chat.repository.ts` SHALL export `MongoChatRepository` implementing `IChatRepository`. Its constructor SHALL accept a `Db` instance. All methods SHALL convert `_id: ObjectId` from MongoDB documents to `_id: string` before returning domain entities, and convert string IDs to `ObjectId` when querying. No `ObjectId` type SHALL appear in method return types.

#### Scenario: create inserts a document and returns a Chat with string _id
- **WHEN** `create('u1', 'My Chat')` is called
- **THEN** a document is inserted into the `chats` collection with `isPinned: false`, `createdAt` and `updatedAt` set to now, and the returned `Chat` has `_id` as a hex string

#### Scenario: findById returns null when no document matches
- **WHEN** `findById('nonexistent-id')` is called
- **THEN** the method returns `null` without throwing

#### Scenario: findById returns a Chat with string _id when found
- **WHEN** `findById(existingId)` is called with a valid hex string
- **THEN** the returned `Chat` has `_id` equal to `existingId` as a string

#### Scenario: listByUser returns chats sorted pinned-first then updatedAt descending
- **WHEN** `listByUser('u1', null, 20)` is called
- **THEN** the result is sorted `{ isPinned: -1, updatedAt: -1 }` and limited to 20 items

#### Scenario: listByUser applies cursor to exclude already-seen items
- **WHEN** `listByUser('u1', cursorId, 20)` is called with a valid hex cursor
- **THEN** only documents with `_id < ObjectId(cursorId)` are returned

#### Scenario: searchByTitle returns chats matching a text query
- **WHEN** `searchByTitle('u1', 'AI')` is called
- **THEN** a `$text: { $search: 'AI' }` query is issued on the `chats` collection filtered by `userId: 'u1'`

#### Scenario: rename updates the title and updatedAt
- **WHEN** `rename(chatId, 'New Title')` is called
- **THEN** a `$set: { title: 'New Title', updatedAt: <now> }` update is applied to the matching document

#### Scenario: togglePin flips the isPinned field
- **WHEN** `togglePin(chatId)` is called
- **THEN** a `$bit` or `$set` update flips `isPinned` from its current value to the opposite

#### Scenario: delete removes the chat document
- **WHEN** `delete(chatId)` is called
- **THEN** the document with that `_id` is removed from the `chats` collection

### Requirement: MongoMessageRepository implements IMessageRepository with ObjectId conversion
`apps/api/src/infrastructure/repositories/mongo-message.repository.ts` SHALL export `MongoMessageRepository` implementing `IMessageRepository`. Its constructor SHALL accept a `Db` instance. All stored documents use `ObjectId` for `_id`; all returned domain `Message` objects use `string` for `_id`.

#### Scenario: save inserts a message and returns it with a string _id
- **WHEN** `save({ chatId, userId, role: 'user', content, toolResults: [], createdAt })` is called
- **THEN** a document is inserted and the returned `Message` has `_id` as a hex string matching the inserted document's `_id`

#### Scenario: findByChatId returns messages ordered by createdAt ascending
- **WHEN** `findByChatId('chat1')` is called
- **THEN** the query uses `{ chatId: 'chat1' }` and sorts by `{ createdAt: 1 }`

#### Scenario: deleteByChatId removes all messages for a chat
- **WHEN** `deleteByChatId('chat1')` is called
- **THEN** `deleteMany({ chatId: 'chat1' })` is executed on the `messages` collection
