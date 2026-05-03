import { streamText, type LanguageModel, type CoreMessage, type Tool } from 'ai';
import type { StreamEvent, ToolPayload } from '@repo/shared';
import type { Message } from '../../domain/entities/message.entity';
import type { IAIProvider } from '../../domain/ports/ai-provider.port';

export class AiSdkProvider implements IAIProvider {
  constructor(
    private readonly model: LanguageModel,
    private readonly tools: Record<string, Tool>,
  ) {}

  async *stream(history: Message[]): AsyncGenerator<StreamEvent> {
    const messages: CoreMessage[] = history.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const sdkResult = streamText({
      model: this.model,
      system:
        'You are a helpful general-purpose AI assistant. Answer any question the user asks. Use your tools when you need the current date, time, or weather; for everything else, answer directly from your knowledge.',
      messages,
      tools: this.tools,
      maxSteps: 5,
    });

    for await (const chunk of sdkResult.fullStream) {
      if (chunk.type === 'text-delta') {
        yield { type: 'text', delta: chunk.textDelta };
      }
    }

    const steps = await sdkResult.steps;
    for (const step of steps) {
      const toolResults = step.toolResults as Array<{ toolName: string; result: unknown }>;
      for (const tr of toolResults) {
        const payload = { toolName: tr.toolName, payload: tr.result } as ToolPayload;
        yield { type: 'tool_result', toolName: tr.toolName, payload };
      }
    }
  }
}
