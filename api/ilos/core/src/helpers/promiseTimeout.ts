import { TimeoutException } from '@ilos/common';

export function promiseTimeout<T>(ms: number, promise: Promise<T>): Promise<T> {
  const timeout = new Promise((_resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new TimeoutException(`Timeout Exception (${ms}ms)`));
    }, ms);
  });

  return Promise.race([promise, timeout]) as Promise<T>;
}
