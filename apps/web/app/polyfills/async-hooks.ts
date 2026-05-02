// Browser polyfill for node:async_hooks — provides AsyncLocalStorage so
// @tanstack/start-storage-context can initialise in the client bundle.
export class AsyncLocalStorage<T = unknown> {
  private _store: T | undefined = undefined;

  run<R>(store: T, fn: (...args: unknown[]) => R, ...args: unknown[]): R {
    const prev = this._store;
    this._store = store;
    try {
      return fn(...args);
    } finally {
      this._store = prev;
    }
  }

  getStore(): T | undefined {
    return this._store;
  }

  enterWith(store: T): void {
    this._store = store;
  }

  disable(): void {}
}

export class AsyncResource {
  constructor(public type: string) {}
  static bind(fn: Function) { return fn; }
  bind(fn: Function) { return fn; }
}
