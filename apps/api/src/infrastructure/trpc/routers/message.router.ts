import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { t } from '../trpc';
import { authedProcedure } from '../middleware/auth.middleware';
import { ChatNotFoundError } from '../../../domain/errors/chat-not-found.error';
import { UnauthorizedError } from '../../../domain/errors/unauthorized.error';

export const messageRouter = t.router({
  list: authedProcedure
    .input(z.object({ chatId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.listMessages.execute({ chatId: input.chatId, userId: ctx.userId });
      } catch (e) {
        if (e instanceof ChatNotFoundError) {
          throw new TRPCError({ code: 'NOT_FOUND', message: e.message });
        }
        if (e instanceof UnauthorizedError) {
          throw new TRPCError({ code: 'FORBIDDEN', message: e.message });
        }
        throw e;
      }
    }),
});
