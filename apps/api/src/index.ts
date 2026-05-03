import './env';
import { connectDb } from './infrastructure/db/mongo';
import { initContainer } from './infrastructure/container';
import { createBetterAuth } from './infrastructure/auth/better-auth.adapter';
import { createApp } from './infrastructure/http/app';
import { env } from './env';

const { db } = await connectDb();
const container = await initContainer(db);
const auth = createBetterAuth(db);
const app = createApp(container, auth);

const server = Bun.serve({ fetch: app.fetch, port: env.PORT });
console.log(`API listening on port ${server.port}`);
