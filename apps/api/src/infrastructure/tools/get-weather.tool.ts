import { tool, jsonSchema } from 'ai';
import type { IWeatherProvider } from '../../domain/ports/weather-provider.port';

export function buildGetWeatherTool(weatherProvider: IWeatherProvider) {
  return tool({
    description: 'Returns current weather for a given location including temperature, condition, and humidity.',
    parameters: jsonSchema<{ location: string }>({
      type: 'object',
      properties: {
        location: { type: 'string', description: 'City name, e.g. "Buenos Aires"' },
      },
      required: ['location'],
    }),
    execute: async ({ location }) => weatherProvider.getWeather(location),
  });
}
