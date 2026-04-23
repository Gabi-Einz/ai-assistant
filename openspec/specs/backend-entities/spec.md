## ADDED Requirements

### Requirement: Chat entity is a pure TypeScript interface with no framework imports
`apps/api/src/domain/entities/chat.entity.ts` SHALL export a `Chat` interface typed with `_id: string`, `userId: string`, `title: string`, `isPinned: boolean`, `createdAt: Date`, and `updatedAt: Date`. No import from MongoDB driver, Zod, Hono, or any other framework SHALL appear in this file.

#### Scenario: Chat interface enforces all required fields
- **WHEN** a value is typed as `Chat`
- **THEN** TypeScript enforces the presence of `_id`, `userId`, `title`, `isPinned`, `createdAt`, and `updatedAt` and rejects objects missing any field

#### Scenario: Chat entity file imports nothing from infrastructure or application
- **WHEN** the TypeScript compiler resolves imports in `chat.entity.ts`
- **THEN** no import path contains `infrastructure`, `application`, `mongodb`, `zod`, `hono`, or any third-party package other than `@repo/shared`

### Requirement: Message entity is a pure TypeScript interface referencing shared types
`apps/api/src/domain/entities/message.entity.ts` SHALL export a `Message` interface typed with `_id: string`, `chatId: string`, `userId: string`, `role: MessageRole`, `content: string`, `toolResults: ToolResult[]`, and `createdAt: Date`. `MessageRole` SHALL be imported from `@repo/shared`. `ToolResult` SHALL be imported from `@repo/shared`.

#### Scenario: Message interface enforces all required fields
- **WHEN** a value is typed as `Message`
- **THEN** TypeScript enforces the presence of all seven fields and rejects objects missing any field

#### Scenario: MessageRole constrains the role field to known literals
- **WHEN** a value with `role: 'admin'` is assigned to a `Message`
- **THEN** TypeScript reports a type error because `'admin'` is not assignable to `MessageRole`

#### Scenario: Message entity imports MessageRole and ToolResult from @repo/shared
- **WHEN** the TypeScript compiler resolves imports in `message.entity.ts`
- **THEN** `MessageRole` and `ToolResult` resolve to their definitions in `@repo/shared` without error
