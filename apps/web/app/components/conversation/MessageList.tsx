import { useEffect, useRef } from "react";
import type { MessageDto, ToolPayload } from "@repo/shared";
import { MessageBubble } from "./MessageBubble";
import { StreamingMessage } from "./StreamingMessage";

interface MessageListProps {
  messages: MessageDto[];
  streamingText: string;
  streamingTools: ToolPayload[];
  isStreaming: boolean;
}

export function MessageList({
  messages,
  streamingText,
  streamingTools,
  isStreaming,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText, streamingTools]);

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-white/30">
        Send a message to start the conversation.
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
      {messages.map((msg) => (
        <MessageBubble
          key={msg._id}
          role={msg.role}
          content={msg.content}
          toolResults={msg.toolResults}
        />
      ))}
      {isStreaming && (
        <StreamingMessage text={streamingText} toolResults={streamingTools} />
      )}
      <div ref={bottomRef} />
    </div>
  );
}
