import { TimeoutException } from "@/ilos/common/index.ts";
import { errorCode, taggedLogger } from "@/lib/logger/tagged.ts";

const log = taggedLogger("[kernel]");

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
      log.debug("timeout", { signature: signature || "", ms });
      reject(new TimeoutException(`Timeout Exception (${ms}ms)`));
    }, ms);
  });

  return Promise.race([promise, timeout])
    .then((res) => {
      clearTimeout(id);
      log.debug("succeeded", { signature: signature || "", ms: new Date().getTime() - s.getTime() });
      return res;
    })
    .catch((err) => {
      clearTimeout(id);
      if (!err.nolog) {
        log.error("failed", { signature: signature || "", ms, error: errorCode(err) });
      }

      throw err;
    }) as Promise<T>;
}
