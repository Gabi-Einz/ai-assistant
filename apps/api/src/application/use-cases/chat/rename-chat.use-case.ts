import type { IChatRepository } from '../../../domain/ports/chat-repository.port';
import { ChatNotFoundError } from '../../../domain/errors/chat-not-found.error';
import { UnauthorizedError } from '../../../domain/errors/unauthorized.error';
import type { RenameChatInput } from '../../dtos/chat.dto';

export class RenameChatUseCase {
  constructor(private readonly chatRepository: IChatRepository) {}

  async execute(input: RenameChatInput): Promise<void> {
    const chat = await this.chatRepository.findById(input.chatId);
    if (!chat) throw new ChatNotFoundError(input.chatId);
    if (chat.userId !== input.userId) throw new UnauthorizedError();
    await this.chatRepository.rename(input.chatId, input.title);
  }
}
