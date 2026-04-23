import type { Container } from '../container';
import type { Auth } from '../auth/better-auth.adapter';

export type AppContext = Container & {
  userId: string | null;
  req: Request;
  auth: Auth;
};

export function createContextFactory(container: Container, auth: Auth) {
  return function createContext({ req }: { req: Request }): AppContext {
    return { ...container, userId: null, req, auth };
  };
}
