import { tool, jsonSchema } from 'ai';
import type { IDateTimeProvider } from '../../domain/ports/datetime-provider.port';

export function buildGetDateTool(dateTimeProvider: IDateTimeProvider) {
  return tool({
    description: 'Returns the current date in YYYY-MM-DD format.',
    parameters: jsonSchema<Record<string, never>>({
      type: 'object',
      properties: {},
    }),
    execute: async () => ({ date: dateTimeProvider.getCurrentDate() }),
  });
}
