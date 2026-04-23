## ADDED Requirements

### Requirement: ChatNotFoundError is a typed domain error class
`apps/api/src/domain/errors/chat-not-found.error.ts` SHALL export a `ChatNotFoundError` class that extends the native `Error` class. Its constructor SHALL accept a `chatId: string` parameter and set `this.message` to a descriptive string that includes the `chatId`. The class SHALL set `this.name = 'ChatNotFoundError'`. No external imports are required.

#### Scenario: ChatNotFoundError is instanceof Error
- **WHEN** `new ChatNotFoundError('abc123')` is thrown and caught
- **THEN** the caught value satisfies `instanceof Error` and `instanceof ChatNotFoundError`

#### Scenario: ChatNotFoundError message includes the chatId
- **WHEN** `new ChatNotFoundError('abc123')` is constructed
- **THEN** `error.message` contains the string `'abc123'`

#### Scenario: ChatNotFoundError has the correct name property
- **WHEN** `new ChatNotFoundError('abc123')` is constructed
- **THEN** `error.name` equals `'ChatNotFoundError'`

### Requirement: UnauthorizedError is a typed domain error class
`apps/api/src/domain/errors/unauthorized.error.ts` SHALL export an `UnauthorizedError` class that extends the native `Error` class. Its constructor SHALL accept an optional `message?: string` parameter with a default message of `'Unauthorized'`. The class SHALL set `this.name = 'UnauthorizedError'`. No external imports are required.

#### Scenario: UnauthorizedError is instanceof Error
- **WHEN** `new UnauthorizedError()` is thrown and caught
- **THEN** the caught value satisfies `instanceof Error` and `instanceof UnauthorizedError`

#### Scenario: UnauthorizedError uses default message when none is provided
- **WHEN** `new UnauthorizedError()` is constructed without arguments
- **THEN** `error.message` equals `'Unauthorized'`

#### Scenario: UnauthorizedError accepts a custom message
- **WHEN** `new UnauthorizedError('Access denied for resource X')` is constructed
- **THEN** `error.message` equals `'Access denied for resource X'`

#### Scenario: UnauthorizedError has the correct name property
- **WHEN** `new UnauthorizedError()` is constructed
- **THEN** `error.name` equals `'UnauthorizedError'`
