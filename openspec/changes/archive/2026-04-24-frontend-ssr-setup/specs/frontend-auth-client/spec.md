## ADDED Requirements

### Requirement: auth-client.ts exports a BetterAuth browser client singleton
`apps/web/app/lib/auth-client.ts` SHALL export `authClient` created with `createAuthClient({ baseURL: import.meta.env.VITE_API_URL })`. The client SHALL be usable for reading the session (`authClient.useSession()`), signing in (`authClient.signIn.email(...)`), signing up (`authClient.signUp.email(...)`), and signing out (`authClient.signOut()`).

#### Scenario: authClient is importable in any route or component
- **WHEN** a component imports `authClient` from `~/lib/auth-client`
- **THEN** it can call `authClient.useSession()` and receive the current session state

#### Scenario: authClient targets VITE_API_URL for auth requests
- **WHEN** `authClient.signIn.email(...)` is called
- **THEN** the request goes to `${VITE_API_URL}/api/auth/sign-in/email`
