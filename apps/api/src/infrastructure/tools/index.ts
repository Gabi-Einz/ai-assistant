import type { IDateTimeProvider } from '../../domain/ports/datetime-provider.port';
import type { IWeatherProvider } from '../../domain/ports/weather-provider.port';
import { buildGetDateTool } from './get-date.tool';
import { buildGetTimeTool } from './get-time.tool';
import { buildGetWeatherTool } from './get-weather.tool';

interface ToolProviders {
  dateTimeProvider: IDateTimeProvider;
  weatherProvider: IWeatherProvider;
}

export function buildTools(providers: ToolProviders) {
  return {
    get_date: buildGetDateTool(providers.dateTimeProvider),
    get_time: buildGetTimeTool(providers.dateTimeProvider),
    get_weather: buildGetWeatherTool(providers.weatherProvider),
  };
}
