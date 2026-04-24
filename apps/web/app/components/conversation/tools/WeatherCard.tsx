import type { GetWeatherPayload } from "@repo/shared";

export function WeatherCard({ payload }: { payload: GetWeatherPayload }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm">
      <div className="flex items-center gap-2 font-medium">
        <span>🌤️</span>
        <span>{payload.location}</span>
      </div>
      <div className="mt-1 flex gap-4 text-white/70">
        <span>{payload.temperature}°C</span>
        <span>{payload.condition}</span>
        <span>💧 {payload.humidity}%</span>
      </div>
    </div>
  );
}
