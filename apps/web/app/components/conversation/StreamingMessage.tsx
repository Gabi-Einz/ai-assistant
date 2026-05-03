import { useState, useEffect } from "react";
import type { ToolPayload } from "@repo/shared";
import { ToolResultModal } from "./ToolResultModal";

interface StreamingMessageProps {
  text: string;
  toolResults: ToolPayload[];
}

export function StreamingMessage({ text, toolResults }: StreamingMessageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasTools = toolResults.length > 0;

  useEffect(() => {
    if (hasTools) setIsModalOpen(true);
  }, [hasTools]);

  return (
    <div className="flex justify-start">
      <div className="flex max-w-[80%] flex-col items-start gap-2">
        {!hasTools && (
          <div className="rounded-2xl bg-white/5 px-4 py-2.5 text-sm leading-relaxed text-white/90">
            {text ? (
              <p className="whitespace-pre-wrap">{text}</p>
            ) : (
              <span className="inline-block h-4 w-1 animate-pulse bg-white/60" />
            )}
          </div>
        )}
        {hasTools && toolResults[0] && (
          <>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 transition-colors hover:text-white"
            >
              🔧 <span>{toolResults[0].toolName}</span>
            </button>
            <ToolResultModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              toolName={toolResults[0].toolName}
              payload={toolResults[0].payload}
              answer={text || undefined}
            />
          </>
        )}
      </div>
    </div>
  );
}
