import { connectDb } from './infrastructure/db/mongo';
import { initContainer } from './infrastructure/container';
import { createBetterAuth } from './infrastructure/auth/better-auth.adapter';
import { createApp } from './infrastructure/http/app';

const { db } = await connectDb();
const container = await initContainer(db);
const auth = createBetterAuth(db);
const app = createApp(container, auth);

const port = Number(process.env.PORT ?? 3000);
console.log(`API listening on port ${port}`);

export default { fetch: app.fetch, port };
