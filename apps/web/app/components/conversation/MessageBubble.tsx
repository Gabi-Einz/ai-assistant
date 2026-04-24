import type { MessageRole, ToolResult } from "@repo/shared";
import { ToolResultCard } from "./ToolResultCard";

interface MessageBubbleProps {
  role: MessageRole;
  content: string;
  toolResults: ToolResult[];
}

export function MessageBubble({ role, content, toolResults }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-2`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? "bg-white/15 text-white"
              : "bg-white/5 text-white/90"
          }`}
        >
          {content && <p className="whitespace-pre-wrap">{content}</p>}
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
