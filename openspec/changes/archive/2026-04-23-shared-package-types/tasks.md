## 1. Package Setup

- [x] 1.1 Add `zod` as a direct dependency in `packages/shared/package.json`
- [x] 1.2 Remove `.gitkeep` from `packages/shared/src/schemas/` and `packages/shared/src/types/`

## 2. Tool Payload Schemas

- [x] 2.1 Create `packages/shared/src/schemas/tool-payloads.schema.ts` with `getDatePayloadSchema` (`{ date: z.string() }`) and export inferred type `GetDatePayload`
- [x] 2.2 Add `getTimePayloadSchema` (`{ time: z.string() }`) and export inferred type `GetTimePayload`
- [x] 2.3 Add `getWeatherPayloadSchema` (`{ location: z.string(), temperature: z.number(), condition: z.string(), humidity: z.number() }`) and export inferred type `GetWeatherPayload`
- [x] 2.4 Export `ToolPayload` discriminated union: `{ toolName: 'get_date'; payload: GetDatePayload } | { toolName: 'get_time'; payload: GetTimePayload } | { toolName: 'get_weather'; payload: GetWeatherPayload }`

## 3. Stream Event Schema

- [x] 3.1 Create `packages/shared/src/schemas/stream-event.schema.ts` with `streamEventSchema` as a Zod discriminated union on `type`
- [x] 3.2 Add text variant: `z.object({ type: z.literal('text'), delta: z.string() })`
- [x] 3.3 Add tool_result variant: `z.object({ type: z.literal('tool_result'), toolName: z.string(), payload: toolPayloadSchema })` — define `toolPayloadSchema` as a Zod union matching `ToolPayload`
- [x] 3.4 Export inferred type `StreamEvent = z.infer<typeof streamEventSchema>`

## 4. Entity Types

- [x] 4.1 Create `packages/shared/src/types/chat.types.ts` — export interfaces `Chat` (`_id`, `userId`, `title`, `isPinned`, `createdAt: Date`, `updatedAt: Date`) and `ChatDto` (same shape, `createdAt`/`updatedAt` as `string`)
- [x] 4.2 Create `packages/shared/src/types/message.types.ts` — export `MessageRole = 'user' | 'assistant'`, interface `Message` (`_id`, `chatId`, `userId`, `role: MessageRole`, `content`, `toolResults: ToolResult[]`, `createdAt: Date`), and `MessageDto` (`createdAt` as `string`)
- [x] 4.3 Export `ToolResult` interface in `chat.types.ts` or a shared types file: `{ toolName: string; payload: ToolPayload }`

## 5. Barrel Export

- [x] 5.1 Update `packages/shared/src/index.ts` to re-export all schemas from `./schemas/tool-payloads.schema`
- [x] 5.2 Re-export all exports from `./schemas/stream-event.schema`
- [x] 5.3 Re-export all exports from `./types/chat.types`
- [x] 5.4 Re-export all exports from `./types/message.types`

## 6. Verification

- [x] 6.1 Run `pnpm --filter @repo/shared typecheck` — zero TypeScript errors
- [x] 6.2 Verify `GetDatePayload`, `GetTimePayload`, `GetWeatherPayload`, `ToolPayload` are importable from `@repo/shared` in a scratch file
- [x] 6.3 Verify `StreamEvent`, `streamEventSchema` are importable from `@repo/shared`
- [x] 6.4 Verify `Chat`, `ChatDto`, `Message`, `MessageDto`, `MessageRole`, `ToolResult` are importable from `@repo/shared`
- [x] 6.5 Run `pnpm turbo typecheck` from root — all packages pass
