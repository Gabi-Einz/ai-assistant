## Requirements

### Requirement: Chat and Message entity types are defined as pure TypeScript interfaces
`packages/shared` SHALL export `Chat`, `Message`, `ToolResult`, `MessageRole`, `ChatDto`, and `MessageDto` as TypeScript types or interfaces with zero framework dependencies. No Zod, no MongoDB driver types, no framework imports SHALL appear in these type files.

#### Scenario: Chat type has all required fields
- **WHEN** a value is typed as `Chat`
- **THEN** TypeScript enforces the presence of `_id: string`, `userId: string`, `title: string`, `isPinned: boolean`, `createdAt: Date`, and `updatedAt: Date`

#### Scenario: Message type has all required fields
- **WHEN** a value is typed as `Message`
- **THEN** TypeScript enforces the presence of `_id: string`, `chatId: string`, `userId: string`, `role: MessageRole`, `content: string`, `toolResults: ToolResult[]`, and `createdAt: Date`

#### Scenario: MessageRole is a string literal union
- **WHEN** a variable is typed as `MessageRole`
- **THEN** only the values `'user'` and `'assistant'` are assignable without a type error

#### Scenario: ToolResult type links toolName to a ToolPayload
- **WHEN** a value is typed as `ToolResult`
- **THEN** TypeScript enforces `toolName: string` and `payload: ToolPayload`

### Requirement: ChatDto and MessageDto are serialization-safe projections
`ChatDto` SHALL be identical to `Chat` except that `createdAt` and `updatedAt` are typed as `string` (ISO 8601). `MessageDto` SHALL be identical to `Message` except that `createdAt` is typed as `string`. These types represent what tRPC procedures return over the wire after JSON serialization.

#### Scenario: ChatDto uses string dates
- **WHEN** a value is typed as `ChatDto`
- **THEN** assigning a `Date` to `createdAt` or `updatedAt` produces a TypeScript error

#### Scenario: MessageDto uses string date
- **WHEN** a value is typed as `MessageDto`
- **THEN** assigning a `Date` to `createdAt` produces a TypeScript error

### Requirement: Entity types are importable from the package root
All entity types SHALL be importable from `@repo/shared` without deep path imports.

#### Scenario: API domain imports Chat type
- **WHEN** `apps/api/src/domain/entities/chat.entity.ts` imports `Chat` from `@repo/shared`
- **THEN** TypeScript resolves the import without error and no circular dependency is introduced

#### Scenario: Frontend query hook imports ChatDto
- **WHEN** `apps/web/app/hooks/useChats.ts` imports `ChatDto` from `@repo/shared`
- **THEN** TypeScript resolves the import without error
