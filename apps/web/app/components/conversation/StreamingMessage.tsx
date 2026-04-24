import type { ToolPayload } from "@repo/shared";
import { ToolResultCard } from "./ToolResultCard";

interface StreamingMessageProps {
  text: string;
  toolResults: ToolPayload[];
}

export function StreamingMessage({ text, toolResults }: StreamingMessageProps) {
  return (
    <div className="flex justify-start">
      <div className="flex max-w-[80%] flex-col items-start gap-2">
        <div className="rounded-2xl bg-white/5 px-4 py-2.5 text-sm leading-relaxed text-white/90">
          {text ? (
            <p className="whitespace-pre-wrap">{text}</p>
          ) : (
            <span className="inline-block h-4 w-1 animate-pulse bg-white/60" />
          )}
        </div>
        {toolResults.length > 0 && (
          <div className="flex flex-col gap-2">
            {toolResults.map((tr, i) => (
              <ToolResultCard key={i} toolName={tr.toolName} payload={tr.payload} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
