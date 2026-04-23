import type { Chat } from '../../../domain/entities/chat.entity';
import type { IChatRepository } from '../../../domain/ports/chat-repository.port';
import type { CreateChatInput } from '../../dtos/chat.dto';

export class CreateChatUseCase {
  constructor(private readonly chatRepository: IChatRepository) {}

  execute(input: CreateChatInput): Promise<Chat> {
    return this.chatRepository.create(input.userId, input.title);
  }
}
