import { z } from 'zod';

export const getDatePayloadSchema = z.object({
  date: z.string(),
});
export type GetDatePayload = z.infer<typeof getDatePayloadSchema>;

export const getTimePayloadSchema = z.object({
  time: z.string(),
});
export type GetTimePayload = z.infer<typeof getTimePayloadSchema>;

export const getWeatherPayloadSchema = z.object({
  location: z.string(),
  temperature: z.number(),
  condition: z.string(),
  humidity: z.number(),
});
export type GetWeatherPayload = z.infer<typeof getWeatherPayloadSchema>;

export type ToolPayload =
  | { toolName: 'get_date'; payload: GetDatePayload }
  | { toolName: 'get_time'; payload: GetTimePayload }
  | { toolName: 'get_weather'; payload: GetWeatherPayload };
