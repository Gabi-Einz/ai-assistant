import type { Chat } from '../entities/chat.entity';

export interface IChatRepository {
  create(userId: string, title: string): Promise<Chat>;
  findById(id: string): Promise<Chat | null>;
  listByUser(userId: string, cursor: string | null, limit: number): Promise<Chat[]>;
  searchByTitle(userId: string, query: string): Promise<Chat[]>;
  rename(id: string, title: string): Promise<void>;
  togglePin(id: string): Promise<void>;
  delete(id: string): Promise<void>;
}
