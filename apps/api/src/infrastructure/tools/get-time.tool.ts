import { tool, jsonSchema } from 'ai';
import type { IDateTimeProvider } from '../../domain/ports/datetime-provider.port';

export function buildGetTimeTool(dateTimeProvider: IDateTimeProvider) {
  return tool({
    description: 'Returns the current time in HH:MM:SS format (24-hour UTC).',
    parameters: jsonSchema<Record<string, never>>({
      type: 'object',
      properties: {},
    }),
    execute: async () => ({ time: dateTimeProvider.getCurrentTime() }),
  });
}
