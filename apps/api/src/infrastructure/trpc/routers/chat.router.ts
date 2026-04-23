import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { t } from '../trpc';
import { authedProcedure } from '../middleware/auth.middleware';
import { ChatNotFoundError } from '../../../domain/errors/chat-not-found.error';
import { UnauthorizedError } from '../../../domain/errors/unauthorized.error';

function mapError(error: unknown): never {
  if (error instanceof ChatNotFoundError) {
    throw new TRPCError({ code: 'NOT_FOUND', message: error.message });
  }
  if (error instanceof UnauthorizedError) {
    throw new TRPCError({ code: 'FORBIDDEN', message: error.message });
  }
  throw error;
}

export const chatRouter = t.router({
  create: authedProcedure
    .input(z.object({ title: z.string().min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.createChat.execute({ userId: ctx.userId, title: input.title });
    }),

  list: authedProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().int().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.listChats.execute({
        userId: ctx.userId,
        cursor: input.cursor ?? null,
        limit: input.limit,
      });
    }),

  search: authedProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      return ctx.searchChats.execute({ userId: ctx.userId, query: input.query });
    }),

  rename: authedProcedure
    .input(z.object({ chatId: z.string(), title: z.string().min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.renameChat.execute({ chatId: input.chatId, userId: ctx.userId, title: input.title });
      } catch (e) {
        return mapError(e);
      }
      return { success: true };
    }),

  togglePin: authedProcedure
    .input(z.object({ chatId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.pinChat.execute({ chatId: input.chatId, userId: ctx.userId });
      } catch (e) {
        return mapError(e);
      }
      return { success: true };
    }),

  delete: authedProcedure
    .input(z.object({ chatId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.deleteChat.execute({ chatId: input.chatId, userId: ctx.userId });
      } catch (e) {
        return mapError(e);
      }
      return { success: true };
    }),
});
