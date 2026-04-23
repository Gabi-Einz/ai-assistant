import type { Chat } from '../../../domain/entities/chat.entity';
import type { IChatRepository } from '../../../domain/ports/chat-repository.port';
import type { SearchChatsInput } from '../../dtos/chat.dto';

export class SearchChatsUseCase {
  constructor(private readonly chatRepository: IChatRepository) {}

  execute(input: SearchChatsInput): Promise<Chat[]> {
    return this.chatRepository.searchByTitle(input.userId, input.query);
  }
}
