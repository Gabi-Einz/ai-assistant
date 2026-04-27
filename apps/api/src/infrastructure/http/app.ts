import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '../trpc/router';
import { createContextFactory } from '../trpc/context';
import { createStreamRoute } from './stream.route';
import type { Container } from '../container';
import type { Auth } from '../auth/better-auth.adapter';
import { env } from '../../env';

export function createApp(container: Container, auth: Auth): Hono {
  const app = new Hono();

  app.use(
    '*',
    cors({
      origin: env.WEB_URL,
      credentials: true,
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  app.all('/api/auth/*', (c) => auth.handler(c.req.raw));

  app.route('/api', createStreamRoute(container, auth));

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
