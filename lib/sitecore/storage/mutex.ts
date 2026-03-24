export class PathCreationMutex {
  private queue: Promise<unknown> = Promise.resolve();

  async lock<T>(fn: () => Promise<T>): Promise<T> {
    const previous = this.queue;
    let resolve!: (value: unknown) => void;

    this.queue = new Promise((r) => (resolve = r));

    try {
      await previous;
      return await fn();
    } finally {
      resolve(undefined);
    }
  }
}
