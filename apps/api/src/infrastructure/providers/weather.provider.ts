import type { GetWeatherPayload } from '@repo/shared';
import type { IWeatherProvider } from '../../domain/ports/weather-provider.port';

interface OpenWeatherResponse {
  main: { temp: number; humidity: number };
  weather: Array<{ description: string }>;
  name: string;
}

export class WeatherProvider implements IWeatherProvider {
  constructor(private readonly apiKey: string) {}

  async getWeather(location: string): Promise<GetWeatherPayload> {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${this.apiKey}&units=metric`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Weather API error ${response.status} for location: ${location}`);
    }

    const data = (await response.json()) as OpenWeatherResponse;

    return {
      location: data.name,
      temperature: Math.round(data.main.temp),
      condition: data.weather[0]?.description ?? 'unknown',
      humidity: data.main.humidity,
    };
  }
}
