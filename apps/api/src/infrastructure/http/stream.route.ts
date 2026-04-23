import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import type { Container } from '../container';
import type { Auth } from '../auth/better-auth.adapter';

export function createStreamRoute(container: Container, auth: Auth): Hono {
  const app = new Hono();

  app.post('/stream', async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    const userId = session.user.id;

    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }

    const { chatId, content } = body as { chatId?: string; content?: string };
    if (!chatId || typeof chatId !== 'string' || chatId.trim() === '') {
      return c.json({ error: 'chatId is required' }, 400);
    }
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return c.json({ error: 'content is required' }, 400);
    }

    return streamSSE(c, async (stream) => {
      const generator = container.sendMessage.execute({ chatId, userId, content });
      try {
        for await (const event of generator) {
          await stream.writeSSE({ data: JSON.stringify(event) });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Stream error';
        await stream.writeSSE({ data: JSON.stringify({ type: 'error', message }) });
      }
      await stream.writeSSE({ data: '[DONE]' });
    });
  });

  return app;
}
