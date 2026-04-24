import { mock } from 'bun:test';
import type { Auth } from '../../../infrastructure/auth/better-auth.adapter';
import type { Container } from '../../../infrastructure/container';
import { createApp } from '../../../infrastructure/http/app';
import type { Chat } from '../../../domain/entities/chat.entity';
import type { Message } from '../../../domain/entities/message.entity';
import type { Hono } from 'hono';

export const TEST_USER_ID = 'test-user-1';
export const TEST_SESSION_HEADER = 'x-test-session';

export const fakeAuth = {
  handler: async (_req: Request) => new Response(null, { status: 404 }),
  api: {
    getSession: async ({ headers }: { headers: Headers }) => {
      if (headers.get(TEST_SESSION_HEADER) === 'valid') {
        return { user: { id: TEST_USER_ID } };
      }
      return null;
    },
  },
} as unknown as Auth;

export const mockChat: Chat = {
  _id: 'chat-1',
  userId: TEST_USER_ID,
  title: 'Test Chat',
  isPinned: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockMessage: Message = {
  _id: 'msg-1',
  chatId: 'chat-1',
  userId: TEST_USER_ID,
  role: 'user',
  content: 'Hello',
  toolResults: [],
  createdAt: new Date('2024-01-01'),
};

export function makeTestContainer(overrides: Partial<Record<keyof Container, { execute: (...args: any[]) => any }>> = {}): Container {
  return {
    createChat: { execute: mock(() => Promise.resolve(mockChat)), ...overrides.createChat },
    listChats: { execute: mock(() => Promise.resolve([mockChat])), ...overrides.listChats },
    searchChats: { execute: mock(() => Promise.resolve([mockChat])), ...overrides.searchChats },
    renameChat: { execute: mock(() => Promise.resolve()), ...overrides.renameChat },
    pinChat: { execute: mock(() => Promise.resolve()), ...overrides.pinChat },
    deleteChat: { execute: mock(() => Promise.resolve()), ...overrides.deleteChat },
    sendMessage: { execute: mock(async function* () {}), ...overrides.sendMessage },
    listMessages: { execute: mock(() => Promise.resolve([mockMessage])), ...overrides.listMessages },
  } as unknown as Container;
}

export function buildTestApp(container?: Container): Hono {
  return createApp(container ?? makeTestContainer(), fakeAuth);
}

export function authedHeaders(): Record<string, string> {
  return { [TEST_SESSION_HEADER]: 'valid', 'content-type': 'application/json' };
}
