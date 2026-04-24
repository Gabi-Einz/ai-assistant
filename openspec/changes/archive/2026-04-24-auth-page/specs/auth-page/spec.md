## ADDED Requirements

### Requirement: /auth route redirects authenticated users server-side
The `/auth` route SHALL use a `beforeLoad` function that calls `authClient.getSession()` on the server. If a valid session exists, the route SHALL throw a redirect to `/chat` before any component renders. Unauthenticated users SHALL see the auth UI without any flash of the `/chat` page.

#### Scenario: Authenticated user navigates to /auth
- **WHEN** a user with a valid session navigates to `/auth`
- **THEN** the server redirects to `/chat` before rendering any HTML

#### Scenario: Unauthenticated user navigates to /auth
- **WHEN** a user with no active session navigates to `/auth`
- **THEN** the `/auth` page renders with the Register tab active by default

### Requirement: Auth page renders a two-tab UI (Register / Login)
The `/auth` route component SHALL render a HeroUI `Tabs` component with two tabs: **Register** and **Login**. The active tab SHALL default to Register on first load. Switching tabs SHALL not trigger any network requests.

#### Scenario: Default tab on page load
- **WHEN** the `/auth` page renders for the first time
- **THEN** the Register tab is active and `RegisterForm` is visible

#### Scenario: Switching to Login tab
- **WHEN** the user clicks the Login tab
- **THEN** the Login tab becomes active and `LoginForm` is visible, with no page reload

### Requirement: RegisterForm validates fields with Zod before submission
`RegisterForm` SHALL use `@tanstack/react-form` with `zodValidator` applied to the `registerSchema` from `@repo/shared`. The form SHALL have two fields: `email` (string, valid email format) and `password` (string, minimum 8 characters). Validation SHALL run on blur for each field and on submit for all fields. Errors SHALL be displayed inline beneath the relevant input.

#### Scenario: Invalid email on blur
- **WHEN** the user blurs the email field with an invalid value (e.g., `"notanemail"`)
- **THEN** an inline error message is shown beneath the email input

#### Scenario: Password too short on blur
- **WHEN** the user blurs the password field with fewer than 8 characters
- **THEN** an inline error message is shown beneath the password input

#### Scenario: Submit with all invalid fields
- **WHEN** the user submits the register form with validation errors present
- **THEN** all field errors are shown and no network request is made

### Requirement: RegisterForm submits via BetterAuth and redirects on success
When the register form is valid, it SHALL call `authClient.signUp.email({ email, password, name: email })`. On success (no error in the response), it SHALL navigate to `/chat` using TanStack Router's `useNavigate`. On failure, it SHALL display a top-level error message above the submit button.

#### Scenario: Successful registration
- **WHEN** the user submits a valid register form
- **THEN** `authClient.signUp.email()` is called, a session cookie is set, and the browser navigates to `/chat`

#### Scenario: Registration with existing email
- **WHEN** the user submits a valid form but BetterAuth returns an error (email already exists)
- **THEN** a top-level error message is displayed and the user remains on `/auth`

### Requirement: LoginForm validates fields with Zod before submission
`LoginForm` SHALL use `@tanstack/react-form` with `zodValidator` applied to the `loginSchema` from `@repo/shared`. The form SHALL have two fields: `email` (valid email) and `password` (non-empty string). Validation and error display behavior SHALL match `RegisterForm`.

#### Scenario: Empty password on submit
- **WHEN** the user submits the login form with an empty password field
- **THEN** an inline error is shown beneath the password input and no network request is made

### Requirement: LoginForm submits via BetterAuth and redirects on success
When the login form is valid, it SHALL call `authClient.signIn.email({ email, password })`. On success, it SHALL navigate to `/chat`. On failure (invalid credentials), it SHALL display a top-level error message.

#### Scenario: Successful login
- **WHEN** the user submits valid credentials
- **THEN** `authClient.signIn.email()` is called, the session cookie is set, and the browser navigates to `/chat`

#### Scenario: Invalid credentials
- **WHEN** the user submits the login form but BetterAuth returns an auth error
- **THEN** a top-level error message is displayed and the user remains on `/auth`

### Requirement: HeroUI provider is available globally
`HeroUIProvider` from `@heroui/react` SHALL wrap the entire component tree in `apps/web/app/routes/__root.tsx`. Tailwind CSS SHALL be configured with content globs covering all `.tsx` files in `apps/web/app/` and imported as the global stylesheet.

#### Scenario: HeroUI components render without provider error
- **WHEN** any route renders a HeroUI component
- **THEN** no "missing provider" React context error is thrown

#### Scenario: Tailwind utility classes apply in production build
- **WHEN** the web app is built with `pnpm --filter @repo/web build`
- **THEN** all Tailwind utility classes used in `apps/web/app/**/*.tsx` are present in the output CSS
