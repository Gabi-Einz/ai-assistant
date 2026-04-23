## ADDED Requirements

### Requirement: StreamEvent is a discriminated union with two variants
`packages/shared` SHALL export a `StreamEvent` type that is a discriminated union on the `type` field with exactly two variants:
- `{ type: 'text'; delta: string }` — a partial text chunk from the AI
- `{ type: 'tool_result'; toolName: string; payload: ToolPayload }` — a completed tool call result

#### Scenario: text variant carries a delta string
- **WHEN** a value is typed as `StreamEvent` and `type === 'text'`
- **THEN** TypeScript narrows `delta` to `string` and `toolName`/`payload` are not accessible

#### Scenario: tool_result variant carries a typed ToolPayload
- **WHEN** a value is typed as `StreamEvent` and `type === 'tool_result'`
- **THEN** TypeScript narrows `payload` to `ToolPayload` and `delta` is not accessible

#### Scenario: exhaustiveness check on StreamEvent type
- **WHEN** a switch statement over `StreamEvent['type']` omits one case and uses a `never` fallthrough
- **THEN** TypeScript reports a type error until both `'text'` and `'tool_result'` are handled

### Requirement: StreamEvent has a corresponding Zod schema for runtime validation
`packages/shared` SHALL export `streamEventSchema` — a Zod discriminated union schema matching the `StreamEvent` type. The schema SHALL be the source of truth for the type (i.e., `StreamEvent = z.infer<typeof streamEventSchema>`).

#### Scenario: valid text event passes schema validation
- **WHEN** `{ type: 'text', delta: 'Hello' }` is parsed with `streamEventSchema`
- **THEN** it returns the value without errors

#### Scenario: valid tool_result event passes schema validation
- **WHEN** `{ type: 'tool_result', toolName: 'get_date', payload: { toolName: 'get_date', payload: { date: '2026-04-22' } } }` is parsed with `streamEventSchema`
- **THEN** it returns the value without errors

#### Scenario: invalid event type fails schema validation
- **WHEN** `{ type: 'unknown', data: {} }` is parsed with `streamEventSchema`
- **THEN** Zod throws a `ZodError` indicating the discriminant value is invalid

### Requirement: StreamEvent type is importable from the package root
`StreamEvent`, `streamEventSchema`, and all related types SHALL be importable from `@repo/shared` without deep path imports.

#### Scenario: backend provider imports StreamEvent
- **WHEN** `apps/api/src/infrastructure/ai/ai-sdk.provider.ts` imports `StreamEvent` from `@repo/shared`
- **THEN** TypeScript resolves the import without error

#### Scenario: frontend renderer imports StreamEvent
- **WHEN** `apps/web/app/components/StreamingMessage.tsx` imports `StreamEvent` from `@repo/shared`
- **THEN** TypeScript resolves the import without error
