import type { IChatRepository } from '../../../domain/ports/chat-repository.port';
import type { IMessageRepository } from '../../../domain/ports/message-repository.port';
import { ChatNotFoundError } from '../../../domain/errors/chat-not-found.error';
import { UnauthorizedError } from '../../../domain/errors/unauthorized.error';
import type { DeleteChatInput } from '../../dtos/chat.dto';

export class DeleteChatUseCase {
  constructor(
    private readonly chatRepository: IChatRepository,
    private readonly messageRepository: IMessageRepository,
  ) {}

  async execute(input: DeleteChatInput): Promise<void> {
    const chat = await this.chatRepository.findById(input.chatId);
    if (!chat) throw new ChatNotFoundError(input.chatId);
    if (chat.userId !== input.userId) throw new UnauthorizedError();
    await this.messageRepository.deleteByChatId(input.chatId);
    await this.chatRepository.delete(input.chatId);
  }
}
