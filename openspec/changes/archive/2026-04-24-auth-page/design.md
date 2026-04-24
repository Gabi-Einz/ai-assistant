## Context

The `/auth` route is a TanStack Start SSR route. Step 10 wired the BetterAuth browser client (`authClient`) and the tRPC+QueryClient infrastructure; this step builds the visible UI on top of that foundation. The route must: (a) redirect authenticated users before rendering, (b) render a two-tab form UI, and (c) call the BetterAuth client on submit and redirect to `/chat` on success.

Key constraints from the architecture:
- SSR rendering strategy for `/auth` (session check happens server-side via `beforeLoad`)
- BetterAuth client is already available at `~/lib/auth-client`
- UI must use HeroUI with dark theme; all layout via Tailwind CSS
- Form state managed by TanStack Form; validation schema from `@repo/shared`
- No custom JWT logic; authentication entirely through BetterAuth

## Goals / Non-Goals

**Goals:**
- Create the `/auth` file route with a `beforeLoad` that reads the session and redirects server-side to `/chat` if active
- Render a tab UI (Register / Login) using HeroUI `Tabs`
- `RegisterForm`: email + password validated with Zod via `@tanstack/react-form`'s `zodValidator`; calls `authClient.signUp.email()`
- `LoginForm`: same pattern; calls `authClient.signIn.email()`
- Field-level error messages rendered beneath each input on blur/submit
- On success: redirect to `/chat` using TanStack Router's `useNavigate`
- Install HeroUI, TanStack Form, Tailwind CSS, and configure them globally

**Non-Goals:**
- OAuth / social login — BetterAuth supports it, but not required here
- "Forgot password" or email verification flows
- Form persistence (no draft saving across reloads)
- Animations beyond HeroUI defaults

## Decisions

### Session check via `beforeLoad` (not a server loader)
TanStack Start's `beforeLoad` runs on every navigation (SSR and CSR). Using it for the session guard means authenticated users are redirected before the component mounts — both on direct navigation and when the browser navigates back.

**Alternative**: `loader` function. Rejected — `loader` is for data fetching; redirect semantics in `beforeLoad` are cleaner and match the TanStack Router convention for auth guards.

### Zod schemas in `packages/shared`
`registerSchema` and `loginSchema` are defined in `@repo/shared/schemas/auth.schema.ts`. This makes them importable by both the frontend form and any future tRPC procedure input validators without duplication.

**Alternative**: Define schemas inline in the route file. Rejected — duplicates the contract; future tRPC auth procedures would need to redefine the same shapes.

### TanStack Form with `zodValidator` adapter
`@tanstack/react-form` natively supports Zod via `zodValidator(schema)`. This gives field-level validation without manual error threading. Each field validator points to the field's sub-schema using `.shape.fieldName`.

**Alternative**: `react-hook-form` + `zod`. Rejected — TanStack Form is the specified requirement and integrates with the TanStack ecosystem already in place.

### HeroUI + Tailwind CSS
HeroUI requires Tailwind CSS. The Vite-based approach uses `@tailwindcss/vite` as a plugin (no PostCSS config file needed in Vite projects). A CSS entry file (`app/tailwind.css`) is imported in `__root.tsx`.

**Alternative**: PostCSS-based Tailwind setup. Rejected — Vite plugin approach is simpler and matches the Vinxi/Vite setup already in place.

### `HeroUIProvider` in `__root.tsx`
HeroUI needs a React context provider wrapping the tree. Adding it in `__root.tsx` (the root route component) makes it available everywhere without per-route setup.

**Alternative**: Add it only in the `/auth` route component. Rejected — HeroUI components will also be used in `/chat` (steps 12–13); centralizing the provider avoids redundancy.

### Error handling on auth failure
`authClient.signUp/signIn` return `{ data, error }`. On error, the form sets a top-level error message (not field-level) since BetterAuth doesn't return per-field errors. Field-level errors come from Zod before submission.

## Risks / Trade-offs

- **HeroUI SSR compatibility**: HeroUI v2 (built on NextUI) is designed for React 18+. React 19 support may have minor rough edges. Mitigation: wrap any HeroUI client-side-only components in a `ClientOnly` boundary if hydration mismatches occur.
- **Tailwind CSS purge in Vinxi**: `@tailwindcss/vite` requires the `content` globs to include all `.tsx` files; if misconfigured, classes will be purged in production. Mitigation: configure content to cover `./app/**/*.{ts,tsx}`.
- **`beforeLoad` session fetch cost**: Every SSR render of `/auth` calls `authClient.getSession()` server-side. This is a fast BetterAuth DB lookup but adds latency. Acceptable for an auth-gated route.
