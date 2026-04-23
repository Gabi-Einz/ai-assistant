import { TRPCError } from '@trpc/server';
import { t } from '../trpc';

export const authMiddleware = t.middleware(async ({ ctx, next }) => {
  const session = await ctx.auth.api.getSession({ headers: ctx.req.headers });
  if (!session) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({ ctx: { ...ctx, userId: session.user.id } });
});

export const authedProcedure = t.procedure.use(authMiddleware);
