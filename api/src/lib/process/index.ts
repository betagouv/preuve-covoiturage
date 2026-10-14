import { errorCode, taggedLogger } from "@/lib/logger/tagged.ts";

const log = taggedLogger("[boot]", { maxLength: 512 });

const reason = (e: unknown): string => e instanceof Error ? e.message : String(e);

export const exit = (code: number | undefined) => {
  Deno.exit(code);
};

export function cwd(): string {
  return Deno.cwd();
}

export function registerOnSignal(
  signal: Deno.Signal,
  f: () => void | Promise<void>,
) {
  Deno.addSignalListener(signal, f);
}

export function registerGracefulShutdown(
  closeHandlers: Array<() => Promise<unknown>> = [],
  timeout = 30,
) {
  function gracefullShutDown(signal: Deno.Signal) {
    return async () => {
      log.info("shutdown start", { signal });
      // shut down anyway after `timeout` seconds
      if (timeout) {
        setTimeout(() => {
          log.error("shutdown timeout");
          exit(1);
        }, timeout * 1000);
      }

      let isError = false;
      for (const handler of closeHandlers) {
        try {
          await Promise.resolve(handler());
        } catch (err) {
          log.error("shutdown handler failed", { error: reason(err) });
          isError = true;
        }
      }
      if (isError) {
        exit(1);
      }

      log.info("shutdown done");
      exit(0);
    };
  }
  registerOnSignal("SIGINT", gracefullShutDown("SIGINT"));
  registerOnSignal("SIGTERM", gracefullShutDown("SIGTERM"));
}

export function catchErrors(
  closeHandlers: Array<() => Promise<unknown>> = [],
  {
    exitOnUncaughtPromiseException = true,
    timeout = 30,
  }: {
    exitOnUncaughtPromiseException?: boolean;
    timeout?: number;
  } = {},
) {
  async function uncaughtExceptionHandler(e: Event) {
    e.preventDefault();
    log.error("uncaught exception", { error: errorCode((e as ErrorEvent).error) });

    // shut down anyway after `timeout` seconds
    if (timeout) {
      setTimeout(() => {
        log.error("shutdown timeout");
        exit(1);
      }, timeout * 1000);
    }

    for (const handler of closeHandlers) {
      try {
        await Promise.resolve(handler());
      } catch (err) {
        log.error("close failed", { error: reason(err) });
      }
    }

    exit(1);
  }
  globalThis.addEventListener("error", uncaughtExceptionHandler);

  async function unhandledRejectionHandler(e: Event & { reason: unknown }) {
    log.error("unhandled rejection", { error: errorCode(e.reason) });
    e.preventDefault();

    // shut down anyway after `timeout` seconds
    if (timeout) {
      setTimeout(() => {
        log.error("shutdown timeout");
        exit(1);
      }, timeout * 1000);
    }

    for (const handler of closeHandlers) {
      try {
        await Promise.resolve(handler());
      } catch (err) {
        log.error("close failed", { error: reason(err) });
      }
    }

    if (exitOnUncaughtPromiseException) {
      exit(1);
    }
  }
  globalThis.addEventListener("unhandledrejection", unhandledRejectionHandler);

  return () => {
    globalThis.removeEventListener("error", uncaughtExceptionHandler);
    globalThis.removeEventListener(
      "unhandledrejection",
      unhandledRejectionHandler,
    );
  };
}
