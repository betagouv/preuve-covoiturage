export function exit(code: number | undefined) {
  Deno.exit(code);
}

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
      console.info(`got kill signal (${signal}), starting graceful shut down`);
      // shut down anyway after `timeout` seconds
      if (timeout) {
        setTimeout(() => {
          console.error("could not finish in time, forcefully exiting");
          exit(1);
        }, timeout * 1000);
      }

      let isError = false;
      for (const handler of closeHandlers) {
        try {
          await Promise.resolve(handler());
        } catch (err) {
          console.error("error happened during graceful shut down", err);
          isError = true;
        }
      }
      if (isError) {
        exit(1);
      }

      console.info("graceful shut down finished");
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
    console.error("uncaught exception", e);

    // shut down anyway after `timeout` seconds
    if (timeout) {
      setTimeout(() => {
        console.error("could not finish in time, forcefully exiting");
        exit(1);
      }, timeout * 1000);
    }

    for (const handler of closeHandlers) {
      try {
        await Promise.resolve(handler());
      } catch (err) {
        console.error("failed to close resource", err);
      }
    }

    exit(1);
  }
  globalThis.addEventListener("error", uncaughtExceptionHandler);

  async function unhandledRejectionHandler(e: Event) {
    e.preventDefault();
    console.error("unhandled promise rejection", e);

    // shut down anyway after `timeout` seconds
    if (timeout) {
      setTimeout(() => {
        console.error("could not finish in time, forcefully exiting");
        exit(1);
      }, timeout * 1000);
    }

    for (const handler of closeHandlers) {
      try {
        await Promise.resolve(handler());
      } catch (err) {
        console.error("failed to close resource", err);
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
