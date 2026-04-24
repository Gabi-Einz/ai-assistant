## 1. Dependencies & Configuration

- [x] 1.1 Add `@heroui/react`, `framer-motion` to `apps/web/package.json` dependencies; add `@tailwindcss/vite` and `tailwindcss` as devDependencies; run `pnpm install`
- [x] 1.2 Add `@tanstack/react-form` and `@tanstack/zod-form-adapter` to `apps/web/package.json` dependencies; run `pnpm install`
- [x] 1.3 Create `apps/web/app/tailwind.css` — global stylesheet with `@import "tailwindcss"` and the HeroUI plugin import
- [x] 1.4 Update `apps/web/app.config.ts` — add `@tailwindcss/vite` as a Vite plugin
- [x] 1.5 Update `apps/web/app/routes/__root.tsx` — import `tailwind.css`, wrap tree with `<HeroUIProvider>` (inside existing providers)

## 2. Shared Auth Schemas

- [x] 2.1 Create `packages/shared/src/schemas/auth.schema.ts` — export `registerSchema` (email: z.string().email(), password: z.string().min(8)) and `loginSchema` (email: z.string().email(), password: z.string().min(1))
- [x] 2.2 Re-export `registerSchema` and `loginSchema` from `packages/shared/src/schemas/index.ts` and from `packages/shared/src/index.ts`

## 3. Auth Route

- [x] 3.1 Create `apps/web/app/routes/auth.tsx` — define `Route` with `createFileRoute('/auth')`, add `beforeLoad` that calls `authClient.getSession()`; if session exists throw `redirect({ to: '/chat' })`
- [x] 3.2 Implement the `AuthPage` component in `auth.tsx` — render a centered card using HeroUI `Card`, with `Tabs` containing "Register" and "Login" tabs

## 4. RegisterForm Component

- [x] 4.1 Create `apps/web/app/components/auth/RegisterForm.tsx` — use `useForm` from `@tanstack/react-form` with `zodValidator` and `registerSchema`; fields: `email` and `password`
- [x] 4.2 Add field-level validation in `RegisterForm` — `validators: { onBlur: zodValidator(registerSchema.shape.email) }` for email; same pattern for password; render `field.state.meta.errors` beneath each HeroUI `Input`
- [x] 4.3 Add submit handler in `RegisterForm` — call `authClient.signUp.email({ email, password, name: email })`; on success navigate to `/chat` via `useNavigate`; on error set a top-level error state and display above the submit button

## 5. LoginForm Component

- [x] 5.1 Create `apps/web/app/components/auth/LoginForm.tsx` — use `useForm` with `zodValidator` and `loginSchema`; fields: `email` and `password`; same field-level validation pattern as RegisterForm
- [x] 5.2 Add submit handler in `LoginForm` — call `authClient.signIn.email({ email, password })`; on success navigate to `/chat`; on error display top-level error message

## 6. Type Check & Build

- [x] 6.1 Run `pnpm --filter @repo/web typecheck` and fix any type errors
- [x] 6.2 Run `pnpm --filter @repo/web build` and confirm successful build
