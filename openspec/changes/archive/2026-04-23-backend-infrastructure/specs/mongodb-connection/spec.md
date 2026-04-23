## ADDED Requirements

### Requirement: MongoDB client is initialized and indexes are created at startup
`apps/api/src/infrastructure/db/mongo.ts` SHALL export an `async connectDb(): Promise<Db>` function that creates a `MongoClient` using `process.env.MONGODB_URI`, pings the server to verify connectivity, and creates all required indexes before returning the typed `Db` handle. The function SHALL be idempotent — calling `createIndex` on an already-existing index must not throw.

#### Scenario: connectDb returns a Db handle on success
- **WHEN** `MONGODB_URI` points to a running MongoDB instance and `connectDb()` is called
- **THEN** the function resolves with a `Db` instance without throwing

#### Scenario: connectDb creates the chats userId+updatedAt index
- **WHEN** `connectDb()` completes successfully
- **THEN** the `chats` collection has a compound index on `{ userId: 1, updatedAt: -1 }`

#### Scenario: connectDb creates the chats text index on title
- **WHEN** `connectDb()` completes successfully
- **THEN** the `chats` collection has a text index on `{ title: 'text' }`

#### Scenario: connectDb creates the messages chatId+createdAt index
- **WHEN** `connectDb()` completes successfully
- **THEN** the `messages` collection has a compound index on `{ chatId: 1, createdAt: 1 }`

#### Scenario: connectDb is idempotent
- **WHEN** `connectDb()` is called a second time on a DB that already has the indexes
- **THEN** the function resolves without error (createIndex does not throw on existing indexes)
