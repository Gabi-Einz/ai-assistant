import type { GetWeatherPayload } from '@repo/shared';

export interface IWeatherProvider {
  getWeather(location: string): Promise<GetWeatherPayload>;
}
