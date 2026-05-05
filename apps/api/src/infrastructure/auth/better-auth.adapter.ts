import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import type { Db } from 'mongodb';
import { env } from '../../env';

export function createBetterAuth(db: Db) {
  return betterAuth({
    database: mongodbAdapter(db),
    emailAndPassword: { enabled: true },
    secret: env.BETTERAUTH_SECRET,
    baseURL: env.API_URL,
    advanced: {
      defaultCookieAttributes: {
        sameSite: "none",
        secure: true,
        partitioned: true,
      },
    },
    trustedOrigins: (request) => {
      const origin = request?.headers?.get('origin') ?? '';
      const webUrl = env.WEB_URL.replace(/\/$/, '');
      if (
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
        origin.endsWith('.vercel.app')
      ) {
        return [origin];
      }
      return [webUrl];
    },
  });
}

export type Auth = ReturnType<typeof createBetterAuth>;
