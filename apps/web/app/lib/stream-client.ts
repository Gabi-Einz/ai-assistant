import type { StreamEvent } from "@repo/shared";

export async function* streamChat(
  chatId: string,
  content: string,
): AsyncGenerator<StreamEvent> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/stream`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId, content }),
    },
  );

  if (!response.ok) {
    throw new Error(`Stream request failed: ${response.status}`);
  }

  if (!response.body) {
    throw new Error("Response body is null");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;

        const raw = trimmed.slice(5).trim();
        if (raw === "[DONE]") return;

        const parsed = JSON.parse(raw) as Record<string, unknown>;
        if (parsed.type === "error") {
          throw new Error((parsed.message as string) ?? "Stream error");
        }

        yield parsed as unknown as StreamEvent;
      }
    }
  } finally {
    reader.releaseLock();
  }
}
