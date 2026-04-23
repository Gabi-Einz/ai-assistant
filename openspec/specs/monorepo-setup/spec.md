## ADDED Requirements

### Requirement: pnpm workspace is configured
The project SHALL use a pnpm workspace declared in `pnpm-workspace.yaml` at the root, listing `apps/*` and `packages/*` as workspace members. Running `pnpm install` from the root SHALL install all dependencies across all packages.

#### Scenario: Workspace install succeeds
- **WHEN** developer runs `pnpm install` from the project root
- **THEN** all dependencies for `apps/web`, `apps/api`, and `packages/shared` are installed without errors

#### Scenario: Internal package is resolvable
- **WHEN** `apps/web` or `apps/api` imports from `@repo/shared`
- **THEN** TypeScript resolves the import to `packages/shared/src` without errors

---

### Requirement: Turborepo orchestrates the build pipeline
The project SHALL include a `turbo.json` at the root defining pipeline tasks: `build`, `dev`, `lint`, and `typecheck`. The `build` task SHALL declare `dependsOn: ["^build"]` so `packages/shared` always builds before consuming apps.

#### Scenario: Build order respects dependencies
- **WHEN** developer runs `pnpm turbo build`
- **THEN** `packages/shared` builds first, then `apps/api` and `apps/web` build in parallel

#### Scenario: Dev task runs all apps concurrently
- **WHEN** developer runs `pnpm turbo dev`
- **THEN** `apps/web` dev server and `apps/api` dev server start concurrently

---

### Requirement: TypeScript strict mode is enforced across all packages
The project SHALL include a root `tsconfig.base.json` with `strict: true`, `noUncheckedIndexedAccess: true`, and `exactOptionalPropertyTypes: true`. Every app and package `tsconfig.json` SHALL extend this base.

#### Scenario: Strict flags apply in all packages
- **WHEN** any TypeScript file in `apps/web`, `apps/api`, or `packages/shared` uses `any` or unsafe index access
- **THEN** `tsc --noEmit` reports a type error

#### Scenario: Per-app tsconfig extends base
- **WHEN** `apps/api/tsconfig.json` is inspected
- **THEN** it contains `"extends": "../../tsconfig.base.json"` and overrides only `target`, `lib`, and `moduleResolution`

---

### Requirement: Path alias `@repo/shared` resolves in both apps
Both `apps/web` and `apps/api` `tsconfig.json` files SHALL declare a `paths` entry mapping `@repo/shared` to `../../packages/shared/src`. This alias SHALL be consistent with the `package.json` `name` field of `packages/shared`.

#### Scenario: Import alias resolves at typecheck
- **WHEN** `apps/api/src/domain/ports/chat-repository.port.ts` imports a type from `@repo/shared`
- **THEN** `tsc --noEmit` resolves the import without error

---

### Requirement: Directory structure matches the hexagonal architecture layout
The scaffolded structure SHALL include the directories defined in `requirements.md`: `apps/web/`, `apps/api/src/domain/`, `apps/api/src/application/`, `apps/api/src/infrastructure/`, and `packages/shared/src/`.

#### Scenario: Backend hexagonal directories exist
- **WHEN** the repository is cloned and `pnpm install` is run
- **THEN** the directories `apps/api/src/domain`, `apps/api/src/application`, and `apps/api/src/infrastructure` exist (may be empty with `.gitkeep`)

---

### Requirement: Environment variable contract is documented
A `.env.example` file SHALL exist at the project root listing all required environment variables with placeholder values and inline comments explaining their purpose.

#### Scenario: Required secrets are documented
- **WHEN** a new developer opens `.env.example`
- **THEN** they can see `MONGODB_URI`, `AI_API_KEY`, `WEATHER_API_KEY`, and `BETTERAUTH_SECRET` with descriptions of what each is used for

---

### Requirement: Root `.gitignore` covers all generated artifacts
The root `.gitignore` SHALL exclude `node_modules/`, `dist/`, `.env`, `.turbo/`, and Turborepo cache directories.

#### Scenario: Secrets are not committed
- **WHEN** developer creates a `.env` file and runs `git status`
- **THEN** `.env` does not appear as an untracked file
