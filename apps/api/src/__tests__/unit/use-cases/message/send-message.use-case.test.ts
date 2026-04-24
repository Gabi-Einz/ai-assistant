import { describe, it, expect, mock } from 'bun:test';
import { SendMessageUseCase } from '../../../../application/use-cases/message/send-message.use-case';
import type { IChatRepository } from '../../../../domain/ports/chat-repository.port';
import type { IMessageRepository } from '../../../../domain/ports/message-repository.port';
import type { IAIProvider } from '../../../../domain/ports/ai-provider.port';
import { ChatNotFoundError } from '../../../../domain/errors/chat-not-found.error';
import { UnauthorizedError } from '../../../../domain/errors/unauthorized.error';
import type { Chat } from '../../../../domain/entities/chat.entity';
import type { Message } from '../../../../domain/entities/message.entity';
import type { StreamEvent } from '@repo/shared';

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

function makeAIProvider(events: StreamEvent[]): IAIProvider {
  return {
    stream: async function* () {
      for (const event of events) {
        yield event;
      }
    },
  };
}

async function collectEvents(gen: AsyncGenerator<StreamEvent>): Promise<StreamEvent[]> {
  const events: StreamEvent[] = [];
  for await (const event of gen) {
    events.push(event);
  }
  return events;
}

describe('SendMessageUseCase', () => {
  it('yields text events and saves assistant message with accumulated content', async () => {
    const chatRepo = makeChatRepo();
    const messageRepo = makeMessageRepo();
    const aiProvider = makeAIProvider([
      { type: 'text', delta: 'Hello' },
      { type: 'text', delta: ' World' },
    ]);
    const useCase = new SendMessageUseCase(chatRepo, messageRepo, aiProvider);

    const events = await collectEvents(useCase.execute({ chatId: 'chat-1', userId: 'user-1', content: 'Hi' }));

    expect(events).toEqual([
      { type: 'text', delta: 'Hello' },
      { type: 'text', delta: ' World' },
    ]);
    expect(messageRepo.save).toHaveBeenLastCalledWith(
      expect.objectContaining({ role: 'assistant', content: 'Hello World', toolResults: [] }),
    );
  });

  it('yields tool_result events and saves assistant message with toolResults', async () => {
    const chatRepo = makeChatRepo();
    const messageRepo = makeMessageRepo();
    const toolEvent: StreamEvent = {
      type: 'tool_result',
      toolName: 'get_date',
      payload: { toolName: 'get_date', payload: { date: '2024-01-01' } },
    };
    const aiProvider = makeAIProvider([toolEvent]);
    const useCase = new SendMessageUseCase(chatRepo, messageRepo, aiProvider);

    const events = await collectEvents(useCase.execute({ chatId: 'chat-1', userId: 'user-1', content: 'What day is it?' }));

    expect(events).toEqual([toolEvent]);
    expect(messageRepo.save).toHaveBeenLastCalledWith(
      expect.objectContaining({
        role: 'assistant',
        toolResults: [{ toolName: 'get_date', payload: { toolName: 'get_date', payload: { date: '2024-01-01' } } }],
      }),
    );
  });

  it('throws ChatNotFoundError when chat does not exist', async () => {
    const chatRepo = makeChatRepo({ findById: mock(() => Promise.resolve(null)) });
    const messageRepo = makeMessageRepo();
    const aiProvider = makeAIProvider([]);
    const useCase = new SendMessageUseCase(chatRepo, messageRepo, aiProvider);

    await expect(
      collectEvents(useCase.execute({ chatId: 'unknown', userId: 'user-1', content: 'Hi' })),
    ).rejects.toBeInstanceOf(ChatNotFoundError);
    expect(messageRepo.save).not.toHaveBeenCalled();
  });

  it('throws UnauthorizedError when requester is not the owner', async () => {
    const chatRepo = makeChatRepo({ findById: mock(() => Promise.resolve({ ...mockChat, userId: 'other-user' })) });
    const messageRepo = makeMessageRepo();
    const aiProvider = makeAIProvider([]);
    const useCase = new SendMessageUseCase(chatRepo, messageRepo, aiProvider);

    await expect(
      collectEvents(useCase.execute({ chatId: 'chat-1', userId: 'user-1', content: 'Hi' })),
    ).rejects.toBeInstanceOf(UnauthorizedError);
    expect(messageRepo.save).not.toHaveBeenCalled();
  });
});
