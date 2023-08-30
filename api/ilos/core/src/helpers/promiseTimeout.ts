import { TimeoutException } from '@ilos/common';

export function promiseTimeout<T>(ms: number, promise: Promise<T>, signature?: string): Promise<T> {
  const s = new Date();
  let id = null;
  const timeout = new Promise((_resolve, reject) => {
    if (id) clearTimeout(id);
    id = setTimeout(() => {
      clearTimeout(id);
      console.debug(`[kernel] ${signature || ''} timeout expired (${ms}ms)`);
      reject(new TimeoutException(`Timeout Exception (${ms}ms)`));
    }, ms);
  });

  return Promise.race([promise, timeout])
    .then((res) => {
      clearTimeout(id);
      console.debug(`[kernel] ${signature || ''} succeeded in ${(new Date().getTime() - s.getTime()) / 1000}s`);
      return res;
    })
    .catch((err) => {
      clearTimeout(id);
      if (!!!err.rpcError?.nolog) {
        console.error(`[kernel] ${signature || ''} failed`, { message: err.message });
      }

      throw err;
    }) as Promise<T>;
}
