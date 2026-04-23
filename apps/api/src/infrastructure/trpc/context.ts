import type { Container } from '../container';

export type AppContext = Container & { userId: string | null };

export function createContextFactory(container: Container) {
  return function createContext(_: { req: Request }): AppContext {
    return {
      ...container,
      userId: null,
    };
  };
}
