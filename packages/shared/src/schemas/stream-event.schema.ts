import { z } from 'zod';
import {
  getDatePayloadSchema,
  getTimePayloadSchema,
  getWeatherPayloadSchema,
} from './tool-payloads.schema';

const toolPayloadSchema = z.discriminatedUnion('toolName', [
  z.object({ toolName: z.literal('get_date'), payload: getDatePayloadSchema }),
  z.object({ toolName: z.literal('get_time'), payload: getTimePayloadSchema }),
  z.object({ toolName: z.literal('get_weather'), payload: getWeatherPayloadSchema }),
]);

export const streamEventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('text'), delta: z.string() }),
  z.object({
    type: z.literal('tool_result'),
    toolName: z.string(),
    payload: toolPayloadSchema,
  }),
]);

export type StreamEvent = z.infer<typeof streamEventSchema>;
