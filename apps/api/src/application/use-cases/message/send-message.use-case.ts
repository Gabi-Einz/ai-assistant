import type { StreamEvent, ToolResult } from '@repo/shared';
import type { IChatRepository } from '../../../domain/ports/chat-repository.port';
import type { IMessageRepository } from '../../../domain/ports/message-repository.port';
import type { IAIProvider } from '../../../domain/ports/ai-provider.port';
import { ChatNotFoundError } from '../../../domain/errors/chat-not-found.error';
import { UnauthorizedError } from '../../../domain/errors/unauthorized.error';
import type { SendMessageInput } from '../../dtos/message.dto';

export class SendMessageUseCase {
  constructor(
    private readonly chatRepository: IChatRepository,
    private readonly messageRepository: IMessageRepository,
    private readonly aiProvider: IAIProvider,
  ) {}

  async *execute(input: SendMessageInput): AsyncGenerator<StreamEvent> {
    const chat = await this.chatRepository.findById(input.chatId);
    if (!chat) throw new ChatNotFoundError(input.chatId);
    if (chat.userId !== input.userId) throw new UnauthorizedError();

    await this.messageRepository.save({
      chatId: input.chatId,
      userId: input.userId,
      role: 'user',
      content: input.content,
      toolResults: [],
      createdAt: new Date(),
    });

    const history = await this.messageRepository.findByChatId(input.chatId);

    let assistantContent = '';
    const toolResults: ToolResult[] = [];

    for await (const event of this.aiProvider.stream(history, [])) {
      yield event;
      if (event.type === 'text') {
        assistantContent += event.delta;
      } else if (event.type === 'tool_result') {
        toolResults.push({ toolName: event.toolName, payload: event.payload });
      }
    }

    await this.messageRepository.save({
      chatId: input.chatId,
      userId: input.userId,
      role: 'assistant',
      content: assistantContent,
      toolResults,
      createdAt: new Date(),
    });
  }
}
