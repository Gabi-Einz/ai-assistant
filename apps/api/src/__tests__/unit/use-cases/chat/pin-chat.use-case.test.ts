import { describe, it, expect, mock } from 'bun:test';
import { PinChatUseCase } from '../../../../application/use-cases/chat/pin-chat.use-case';
import type { IChatRepository } from '../../../../domain/ports/chat-repository.port';
import { ChatNotFoundError } from '../../../../domain/errors/chat-not-found.error';
import { UnauthorizedError } from '../../../../domain/errors/unauthorized.error';
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
    findById: mock(() => Promise.resolve(mockChat)),
    listByUser: mock(() => Promise.resolve([])),
    searchByTitle: mock(() => Promise.resolve([])),
    rename: mock(() => Promise.resolve()),
    togglePin: mock(() => Promise.resolve()),
    delete: mock(() => Promise.resolve()),
    ...overrides,
  };
}

describe('PinChatUseCase', () => {
  it('toggles pin when owner requests', async () => {
    const chatRepo = makeChatRepo();
    const useCase = new PinChatUseCase(chatRepo);

    await useCase.execute({ chatId: 'chat-1', userId: 'user-1' });

    expect(chatRepo.togglePin).toHaveBeenCalledWith('chat-1');
  });

  it('throws ChatNotFoundError when chat does not exist', async () => {
    const chatRepo = makeChatRepo({ findById: mock(() => Promise.resolve(null)) });
    const useCase = new PinChatUseCase(chatRepo);

    expect(useCase.execute({ chatId: 'unknown', userId: 'user-1' })).rejects.toBeInstanceOf(ChatNotFoundError);
  });

  it('throws UnauthorizedError when requester is not the owner', async () => {
    const chatRepo = makeChatRepo({ findById: mock(() => Promise.resolve({ ...mockChat, userId: 'other-user' })) });
    const useCase = new PinChatUseCase(chatRepo);

    expect(useCase.execute({ chatId: 'chat-1', userId: 'user-1' })).rejects.toBeInstanceOf(UnauthorizedError);
  });
});
