import { RPCException, RPCErrorLevel, TimeoutException } from '@ilos/common';

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
    .catch((err: RPCException) => {
      clearTimeout(id);

      const message = `[kernel] ${signature || ''} failed`;
      const payload = { message: err.message };

      switch (err.level) {
        case RPCErrorLevel.SILENT:
          break;
        case RPCErrorLevel.WARN:
          console.warn(message, payload);
          break;
        case RPCErrorLevel.INFO:
          console.info(message, payload);
          break;
        case RPCErrorLevel.DEBUG:
          console.debug(message, payload);
          break;
        case RPCErrorLevel.ERROR:
        default:
          console.error(message, payload);
      }

      throw err;
    }) as Promise<T>;
}
