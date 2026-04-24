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

console.log(`API listening on port ${env.PORT}`);

export default { fetch: app.fetch, port: env.PORT };
