import type { Message } from '../entities/message.entity';

export interface IMessageRepository {
  save(message: Omit<Message, '_id'>): Promise<Message>;
  findByChatId(chatId: string): Promise<Message[]>;
  deleteByChatId(chatId: string): Promise<void>;
}
