import { Hono } from 'hono';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '../trpc/router';
import { createContextFactory } from '../trpc/context';
import type { Container } from '../container';
import type { Auth } from '../auth/better-auth.adapter';

export function createApp(container: Container, auth: Auth): Hono {
  const app = new Hono();

  app.all('/api/auth/*', (c) => auth.handler(c.req.raw));

  app.all('/trpc/*', (c) =>
    fetchRequestHandler({
      endpoint: '/trpc',
      req: c.req.raw,
      router: appRouter,
      createContext: createContextFactory(container, auth),
    }),
  );

  return app;
}
