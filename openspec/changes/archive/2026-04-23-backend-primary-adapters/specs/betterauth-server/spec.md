## ADDED Requirements

### Requirement: BetterAuth server instance is created with MongoDB adapter and email/password plugin
`apps/api/src/infrastructure/auth/better-auth.adapter.ts` SHALL export `function createBetterAuth(client: MongoClient): Auth` that calls `betterAuth` with `mongodbAdapter(client)`, the `emailAndPassword` plugin enabled, and `secret` from `process.env.BETTERAUTH_SECRET`. The returned instance SHALL be usable as both a request handler and a session validator.

#### Scenario: BetterAuth is configured with the MongoDB adapter
- **WHEN** `createBetterAuth(mongoClient)` is called
- **THEN** BetterAuth manages `users` and `sessions` collections in the same MongoDB database used by the application

#### Scenario: Email/password plugin is active
- **WHEN** a POST request is made to `/api/auth/sign-up/email`
- **THEN** BetterAuth creates a user with hashed password and returns a session token

#### Scenario: auth.api.getSession validates an active session
- **WHEN** `auth.api.getSession({ headers })` is called with headers containing a valid session cookie
- **THEN** it returns an object with `user.id` equal to the authenticated user's ID

#### Scenario: auth.api.getSession returns null for missing session
- **WHEN** `auth.api.getSession({ headers })` is called with headers containing no or expired session cookie
- **THEN** it returns `null`
