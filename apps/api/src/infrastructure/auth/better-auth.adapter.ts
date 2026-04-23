import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import type { Db } from 'mongodb';

export function createBetterAuth(db: Db) {
  return betterAuth({
    database: mongodbAdapter(db),
    emailAndPassword: { enabled: true },
    secret: process.env.BETTERAUTH_SECRET ?? '',
  });
}

export type Auth = ReturnType<typeof createBetterAuth>;
