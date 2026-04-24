import { useCallback, useState } from "react";
import { useSearch } from "@tanstack/react-router";
import type { MessageDto, ToolPayload } from "@repo/shared";
import { trpc } from "~/lib/trpc";
import { streamChat } from "~/lib/stream-client";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";

export function Conversation() {
  const { chatId } = useSearch({ from: "/chat" });

  const [streamingText, setStreamingText] = useState("");
  const [streamingTools, setStreamingTools] = useState<ToolPayload[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const utils = trpc.useUtils();

  const messagesQuery = trpc.message.list.useQuery(
    { chatId: chatId! },
    { enabled: !!chatId },
  );

  const handleSubmit = useCallback(
    async (content: string) => {
      if (!chatId || isStreaming) return;

      setIsStreaming(true);
      setStreamingText("");
      setStreamingTools([]);
      setError(null);

      try {
        for await (const event of streamChat(chatId, content)) {
          if (event.type === "text") {
            setStreamingText((prev) => prev + event.delta);
          } else if (event.type === "tool_result") {
            setStreamingTools((prev) => [...prev, event.payload]);
          }
        }
        await utils.message.list.invalidate({ chatId });
        await utils.chat.list.invalidate();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setIsStreaming(false);
        setStreamingText("");
        setStreamingTools([]);
      }
    },
    [chatId, isStreaming, utils],
  );

  if (!chatId) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-white/30">
        Select a chat or create a new one.
      </div>
    );
  }

  const messages = (messagesQuery.data as MessageDto[] | undefined) ?? [];

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {messagesQuery.isLoading && (
        <div className="flex flex-1 items-center justify-center text-sm text-white/40">
          Loading messages...
        </div>
      )}

      {messagesQuery.isError && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-sm text-red-400">
          <p>Failed to load messages.</p>
          <button
            onClick={() => messagesQuery.refetch()}
            className="rounded px-3 py-1 text-xs underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {!messagesQuery.isLoading && !messagesQuery.isError && (
        <MessageList
          messages={messages}
          streamingText={streamingText}
          streamingTools={streamingTools}
          isStreaming={isStreaming}
        />
      )}

      {error && (
        <p className="px-4 pb-1 text-xs text-red-400">{error}</p>
      )}

      <MessageInput onSubmit={handleSubmit} isStreaming={isStreaming} />
    </div>
  );
}
