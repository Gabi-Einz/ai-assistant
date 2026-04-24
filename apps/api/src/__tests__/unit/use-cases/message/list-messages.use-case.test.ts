import { describe, it, expect, mock } from 'bun:test';
import { ListMessagesUseCase } from '../../../../application/use-cases/message/list-messages.use-case';
import type { IChatRepository } from '../../../../domain/ports/chat-repository.port';
import type { IMessageRepository } from '../../../../domain/ports/message-repository.port';
import type { Chat } from '../../../../domain/entities/chat.entity';
import type { Message } from '../../../../domain/entities/message.entity';

const mockChat: Chat = {
  _id: 'chat-1',
  userId: 'user-1',
  title: 'Test Chat',
  isPinned: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const mockMessage: Message = {
  _id: 'msg-1',
  chatId: 'chat-1',
  userId: 'user-1',
  role: 'user',
  content: 'Hello',
  toolResults: [],
  createdAt: new Date('2024-01-01'),
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

function makeMessageRepo(overrides?: Partial<IMessageRepository>): IMessageRepository {
  return {
    save: mock(() => Promise.resolve(mockMessage)),
    findByChatId: mock(() => Promise.resolve([mockMessage])),
    deleteByChatId: mock(() => Promise.resolve()),
    ...overrides,
  };
}

describe('ListMessagesUseCase', () => {
  it('calls findByChatId and returns the result', async () => {
    const chatRepo = makeChatRepo();
    const messageRepo = makeMessageRepo();
    const useCase = new ListMessagesUseCase(chatRepo, messageRepo);

    const result = await useCase.execute({ chatId: 'chat-1', userId: 'user-1' });

    expect(messageRepo.findByChatId).toHaveBeenCalledWith('chat-1');
    expect(result).toEqual([mockMessage]);
  });
});
