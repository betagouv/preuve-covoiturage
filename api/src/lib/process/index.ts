import { logger } from "@/lib/logger/index.ts";

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
      logger.info(`got kill signal (${signal}), starting graceful shut down`);
      // shut down anyway after `timeout` seconds
      if (timeout) {
        setTimeout(() => {
          logger.error("could not finish in time, forcefully exiting");
          exit(1);
        }, timeout * 1000);
      }

      let isError = false;
      for (const handler of closeHandlers) {
        try {
          await Promise.resolve(handler());
        } catch (err) {
          logger.error("error happened during graceful shut down", err);
          isError = true;
        }
      }
      if (isError) {
        exit(1);
      }

      logger.info("graceful shut down finished");
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
    logger.error("uncaught exception", e);

    // shut down anyway after `timeout` seconds
    if (timeout) {
      setTimeout(() => {
        logger.error("could not finish in time, forcefully exiting");
        exit(1);
      }, timeout * 1000);
    }

    for (const handler of closeHandlers) {
      try {
        await Promise.resolve(handler());
      } catch (err) {
        logger.error("failed to close resource", err);
      }
    }

    exit(1);
  }
  globalThis.addEventListener("error", uncaughtExceptionHandler);

  async function unhandledRejectionHandler(e: Event & { reason: unknown }) {
    logger.error("Unhandled Rejection", e.reason);
    e.preventDefault();

    // shut down anyway after `timeout` seconds
    if (timeout) {
      setTimeout(() => {
        logger.error("could not finish in time, forcefully exiting");
        exit(1);
      }, timeout * 1000);
    }

    for (const handler of closeHandlers) {
      try {
        await Promise.resolve(handler());
      } catch (err) {
        logger.error("failed to close resource", err);
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
