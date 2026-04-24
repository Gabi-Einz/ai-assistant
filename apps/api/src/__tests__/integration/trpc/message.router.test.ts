import { describe, it, expect } from 'bun:test';
import { authedHeaders, buildTestApp, mockMessage } from '../helpers/fake-auth';

async function trpcGet(app: ReturnType<typeof buildTestApp>, procedure: string, input: unknown, headers?: Record<string, string>) {
  const encoded = encodeURIComponent(JSON.stringify(input));
  return app.request(`/trpc/${procedure}?input=${encoded}`, {
    method: 'GET',
    headers: headers ?? {},
  });
}

describe('message.router (integration)', () => {
  describe('message.list', () => {
    it('returns messages for a chat for authenticated user', async () => {
      const app = buildTestApp();
      const res = await trpcGet(app, 'message.list', { chatId: 'chat-1' }, authedHeaders());

      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(Array.isArray(body.result.data)).toBe(true);
      expect(body.result.data[0]._id).toBe(mockMessage._id);
    });

    it('returns UNAUTHORIZED when no session is present', async () => {
      const app = buildTestApp();
      const res = await trpcGet(app, 'message.list', { chatId: 'chat-1' });

      expect(res.status).toBe(401);
      const body = await res.json() as any;
      expect(body.error.data.code).toBe('UNAUTHORIZED');
    });
  });
});
