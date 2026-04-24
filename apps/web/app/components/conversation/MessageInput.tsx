import { useState } from "react";

interface MessageInputProps {
  onSubmit: (content: string) => void;
  isStreaming: boolean;
}

export function MessageInput({ onSubmit, isStreaming }: MessageInputProps) {
  const [value, setValue] = useState("");

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || isStreaming) return;
    setValue("");
    onSubmit(trimmed);
  }

  return (
    <div className="flex gap-2 border-t border-white/10 p-4">
      <textarea
        className="flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-white/20 disabled:opacity-50"
        rows={2}
        placeholder="Type a message..."
        value={value}
        disabled={isStreaming}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
      />
      <button
        onClick={submit}
        disabled={isStreaming || !value.trim()}
        className="self-end rounded-xl bg-white/15 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isStreaming ? "..." : "Send"}
      </button>
    </div>
  );
}
