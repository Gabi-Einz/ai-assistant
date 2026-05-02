import { useState } from "react";
import type { MessageRole, ToolResult } from "@repo/shared";
import { ToolResultModal } from "./ToolResultModal";

interface MessageBubbleProps {
  role: MessageRole;
  content: string;
  toolResults: ToolResult[];
}

export function MessageBubble({ role, content, toolResults }: MessageBubbleProps) {
  const isUser = role === "user";
  const [openModalIndex, setOpenModalIndex] = useState<number | null>(null);

  const showText = content && (isUser || toolResults.length === 0);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-2`}>
        {showText && (
          <div
            className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              isUser
                ? "bg-white/15 text-white"
                : "bg-white/5 text-white/90"
            }`}
          >
            <p className="whitespace-pre-wrap">{content}</p>
          </div>
        )}
        {toolResults.length > 0 && (
          <div className="flex flex-col gap-2">
            {toolResults.map((tr, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenModalIndex(i)}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 transition-colors hover:text-white"
                >
                  🔧 <span>{tr.toolName}</span>
                </button>
                <ToolResultModal
                  isOpen={openModalIndex === i}
                  onClose={() => setOpenModalIndex(null)}
                  toolName={tr.toolName}
                  payload={tr.payload}
                  answer={content || undefined}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
