import { TimeoutException } from "@/ilos/common/index.ts";
import { logger } from "@/lib/logger/index.ts";

export function promiseTimeout<T>(
  ms: number,
  promise: Promise<T>,
  signature?: string,
): Promise<T> {
  const s = new Date();

  // timeout id
  let id: number = 0;

  const timeout = new Promise((_resolve, reject) => {
    if (id) clearTimeout(id);
    id = setTimeout(() => {
      clearTimeout(id);
      logger.debug(`[kernel] ${signature || ""} timeout expired (${ms}ms)`);
      reject(new TimeoutException(`Timeout Exception (${ms}ms)`));
    }, ms);
  });

  return Promise.race([promise, timeout])
    .then((res) => {
      clearTimeout(id);
      logger.debug(
        `[kernel] ${signature || ""} succeeded in ${
          (new Date().getTime() - s.getTime()) / 1000
        }s`,
      );
      return res;
    })
    .catch((err) => {
      clearTimeout(id);
      if (!err.nolog) {
        logger.error(`[kernel] ${signature || ""} failed`, {
          message: err.message,
        });
      }

      throw err;
    }) as Promise<T>;
}
