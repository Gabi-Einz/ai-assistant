import { describe, it, expect, mock } from 'bun:test';
import { CreateChatUseCase } from '../../../../application/use-cases/chat/create-chat.use-case';
import type { IChatRepository } from '../../../../domain/ports/chat-repository.port';
import type { Chat } from '../../../../domain/entities/chat.entity';

const mockChat: Chat = {
  _id: 'chat-1',
  userId: 'user-1',
  title: 'Test Chat',
  isPinned: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

function makeChatRepo(overrides?: Partial<IChatRepository>): IChatRepository {
  return {
    create: mock(() => Promise.resolve(mockChat)),
    findById: mock(() => Promise.resolve(null)),
    listByUser: mock(() => Promise.resolve([])),
    searchByTitle: mock(() => Promise.resolve([])),
    rename: mock(() => Promise.resolve()),
    togglePin: mock(() => Promise.resolve()),
    delete: mock(() => Promise.resolve()),
    ...overrides,
  };
}

describe('CreateChatUseCase', () => {
  it('calls create on the repository and returns the result', async () => {
    const chatRepo = makeChatRepo();
    const useCase = new CreateChatUseCase(chatRepo);

    const result = await useCase.execute({ userId: 'user-1', title: 'Test Chat' });

    expect(chatRepo.create).toHaveBeenCalledWith('user-1', 'Test Chat');
    expect(result).toEqual(mockChat);
  });
});
