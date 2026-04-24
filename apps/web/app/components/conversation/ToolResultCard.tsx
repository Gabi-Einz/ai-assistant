import type { ToolPayload } from "@repo/shared";
import { DateCard } from "./tools/DateCard";
import { TimeCard } from "./tools/TimeCard";
import { WeatherCard } from "./tools/WeatherCard";

type AnyPayload = ToolPayload["payload"];

const registry: Record<string, React.FC<{ payload: AnyPayload }>> = {
  get_date: DateCard as React.FC<{ payload: AnyPayload }>,
  get_time: TimeCard as React.FC<{ payload: AnyPayload }>,
  get_weather: WeatherCard as React.FC<{ payload: AnyPayload }>,
};

interface ToolResultCardProps {
  toolName: string;
  payload: unknown;
}

export function ToolResultCard({ toolName, payload }: ToolResultCardProps) {
  const Component = registry[toolName];

  if (!Component) {
    return (
      <pre className="overflow-x-auto rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white/70">
        {JSON.stringify(payload, null, 2)}
      </pre>
    );
  }

  return <Component payload={payload as AnyPayload} />;
}
