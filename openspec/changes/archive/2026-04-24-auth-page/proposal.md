## Why

The `/auth` route is the entry point of the application — without it, users cannot register or log in, and no protected route is reachable. This step delivers the complete authentication UI backed by the BetterAuth client set up in step 10.

## What Changes

- Install `@heroui/react` and `@tanstack/react-form` in `apps/web`
- Add `tailwindcss` and `framer-motion` (HeroUI peer deps) to `apps/web`
- Define Zod schemas for register and login form inputs in `packages/shared`
- Create `apps/web/app/routes/auth.tsx` — TanStack Start file route for `/auth`
  - Server loader validates session via `authClient`; redirects to `/chat` if active
  - Component renders two-tab UI (Register / Login) using HeroUI
- Create `apps/web/app/components/auth/RegisterForm.tsx` — TanStack Form + Zod, calls `authClient.signUp.email()`
- Create `apps/web/app/components/auth/LoginForm.tsx` — TanStack Form + Zod, calls `authClient.signIn.email()`
- Configure HeroUI provider in `apps/web/app/routes/__root.tsx` (wrap tree with `HeroUIProvider`)
- Configure Tailwind CSS for `apps/web`

## Capabilities

### New Capabilities
- `auth-page`: `/auth` route with SSR session guard, two-tab register/login UI, field-level Zod validation, BetterAuth client integration, and client-side redirect on success

### Modified Capabilities
<!-- none -->

## Impact

- `apps/web/package.json` — new deps: `@heroui/react`, `@tanstack/react-form`, `tailwindcss`, `framer-motion`, `@tailwindcss/vite`
- `packages/shared/src/schemas/` — new `auth.schema.ts` with `registerSchema` and `loginSchema`
- `apps/web/app/routes/auth.tsx` — new file
- `apps/web/app/routes/__root.tsx` — add `HeroUIProvider` wrapper
- `apps/web/app/components/auth/` — new directory with `RegisterForm.tsx`, `LoginForm.tsx`
- `apps/web/app/` — new `tailwind.css` entry point, Tailwind config
