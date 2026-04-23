import type { Chat } from '../../../domain/entities/chat.entity';
import type { IChatRepository } from '../../../domain/ports/chat-repository.port';
import type { ListChatsInput } from '../../dtos/chat.dto';

export class ListChatsUseCase {
  constructor(private readonly chatRepository: IChatRepository) {}

  execute(input: ListChatsInput): Promise<Chat[]> {
    return this.chatRepository.listByUser(input.userId, input.cursor, input.limit);
  }
}
