import { t } from './trpc';
import { chatRouter } from './routers/chat.router';
import { messageRouter } from './routers/message.router';

export const appRouter = t.router({
  chat: chatRouter,
  message: messageRouter,
});

export type AppRouter = typeof appRouter;
