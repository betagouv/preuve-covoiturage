export function catchErrors(
  closeHandlers: Array<() => Promise<any>> = [],
  {
    exitOnUncaughtPromiseException = true,
    timeout = 30,
  }: {
    exitOnUncaughtPromiseException?: boolean;
    timeout?: number;
  } = {},
) {
  // it is not safe to resume normal operation after 'uncaughtException'.
  // read more: https://nodejs.org/api/process.html#process_event_uncaughtexception
  const uncaughtExceptionHandler = async (err: Error) => {
    console.error(err, 'uncaught exception');

    // shut down anyway after `timeout` seconds
    if (timeout) {
      setTimeout(() => {
        console.error('could not finish in time, forcefully exiting');
        process.exit(1);
      }, timeout * 1000).unref();
    }

    for (const handler of closeHandlers) {
      try {
        await Promise.resolve(handler());
      } catch (err) {
        console.error(err, 'failed to close resource');
      }
    }

    process.exit(1);
  };
  process.on('uncaughtException', uncaughtExceptionHandler);

  // a Promise is rejected and no error handler is attached.
  // read more: https://nodejs.org/api/process.html#process_event_unhandledrejection
  const unhandledRejectionHandler = async (reason: any = {}, promise: Promise<any>) => {
    console.error(reason, 'unhandled promise rejection');

    // shut down anyway after `timeout` seconds
    if (timeout) {
      setTimeout(() => {
        console.error('could not finish in time, forcefully exiting');
        process.exit(1);
      }, timeout * 1000).unref();
    }

    for (const handler of closeHandlers) {
      try {
        await Promise.resolve(handler());
      } catch (err) {
        console.error(err, 'failed to close resource');
      }
    }

    if (exitOnUncaughtPromiseException) {
      process.exit(1);
    }
  };
  process.on('unhandledRejection', unhandledRejectionHandler);

  return () => {
    process.off('uncaughtException', uncaughtExceptionHandler);
    process.off('unhandledRejection', unhandledRejectionHandler);
  };
}
