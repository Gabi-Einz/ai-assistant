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

  const isLocalhost = (origin: string) =>
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

  app.use(
    '*',
    cors({
      origin: (origin) => (origin && isLocalhost(origin) ? origin : env.WEB_URL),
      credentials: true,
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  app.all('/api/auth/*', async (c) => {
    const origin = c.req.header('origin') ?? '';
    const allowedOrigin = isLocalhost(origin) ? origin : env.WEB_URL;

    if (c.req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': allowedOrigin,
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        },
      });
    }

    const response = await auth.handler(c.req.raw);
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', allowedOrigin);
    headers.set('Access-Control-Allow-Credentials', 'true');
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  });

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
