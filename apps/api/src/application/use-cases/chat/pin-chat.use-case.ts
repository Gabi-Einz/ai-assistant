import type { IChatRepository } from '../../../domain/ports/chat-repository.port';
import { ChatNotFoundError } from '../../../domain/errors/chat-not-found.error';
import { UnauthorizedError } from '../../../domain/errors/unauthorized.error';
import type { PinChatInput } from '../../dtos/chat.dto';

export class PinChatUseCase {
  constructor(private readonly chatRepository: IChatRepository) {}

  async execute(input: PinChatInput): Promise<void> {
    const chat = await this.chatRepository.findById(input.chatId);
    if (!chat) throw new ChatNotFoundError(input.chatId);
    if (chat.userId !== input.userId) throw new UnauthorizedError();
    await this.chatRepository.togglePin(input.chatId);
  }
}
