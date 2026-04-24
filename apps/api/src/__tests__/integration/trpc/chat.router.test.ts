import { describe, it, expect, mock } from 'bun:test';
import { ChatNotFoundError } from '../../../domain/errors/chat-not-found.error';
import { authedHeaders, buildTestApp, makeTestContainer, mockChat } from '../helpers/fake-auth';

async function trpcPost(app: ReturnType<typeof buildTestApp>, procedure: string, input: unknown, headers?: Record<string, string>) {
  return app.request(`/trpc/${procedure}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(headers ?? {}) },
    body: JSON.stringify(input),
  });
}

async function trpcGet(app: ReturnType<typeof buildTestApp>, procedure: string, input: unknown, headers?: Record<string, string>) {
  const encoded = encodeURIComponent(JSON.stringify(input));
  return app.request(`/trpc/${procedure}?input=${encoded}`, {
    method: 'GET',
    headers: headers ?? {},
  });
}

describe('chat.router (integration)', () => {
  describe('chat.create', () => {
    it('returns the created chat for authenticated user', async () => {
      const app = buildTestApp();
      const res = await trpcPost(app, 'chat.create', { title: 'Test Chat' }, authedHeaders());

      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.result.data._id).toBe(mockChat._id);
      expect(body.result.data.title).toBe(mockChat.title);
    });
  });

  describe('chat.list', () => {
    it('returns a list of chats for authenticated user', async () => {
      const app = buildTestApp();
      const res = await trpcGet(app, 'chat.list', { limit: 20 }, authedHeaders());

      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(Array.isArray(body.result.data)).toBe(true);
      expect(body.result.data.length).toBe(1);
    });
  });

  describe('chat.delete', () => {
    it('returns success for authenticated user', async () => {
      const app = buildTestApp();
      const res = await trpcPost(app, 'chat.delete', { chatId: 'chat-1' }, authedHeaders());

      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.result.data).toEqual({ success: true });
    });

    it('returns NOT_FOUND when chat does not exist', async () => {
      const container = makeTestContainer({
        deleteChat: { execute: mock(() => Promise.reject(new ChatNotFoundError('unknown'))) },
      });
      const app = buildTestApp(container);
      const res = await trpcPost(app, 'chat.delete', { chatId: 'unknown' }, authedHeaders());

      expect(res.status).toBe(404);
      const body = await res.json() as any;
      expect(body.error.data.code).toBe('NOT_FOUND');
    });
  });

  describe('unauthenticated access', () => {
    it('returns UNAUTHORIZED when no session is present', async () => {
      const app = buildTestApp();
      const res = await trpcPost(app, 'chat.create', { title: 'Test' });

      expect(res.status).toBe(401);
      const body = await res.json() as any;
      expect(body.error.data.code).toBe('UNAUTHORIZED');
    });
  });
});
