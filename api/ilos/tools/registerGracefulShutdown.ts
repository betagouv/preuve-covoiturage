export function registerGracefulShutdown(
  // https://www.typescriptlang.org/docs/handbook/functions.html#this-parameters
  this: any,
  closeHandlers: Array<() => Promise<any>> = [],
  timeout = 30,
) {
  // gracefully shutdown on SIGTERM or SIGINT signal
  process.once('SIGTERM', gracefulShutDown.bind(this, 'SIGTERM'));
  process.once('SIGINT', gracefulShutDown.bind(this, 'SIGINT'));

  async function gracefulShutDown(signal = 'SIGTERM') {
    console.info(`got kill signal (${signal}), starting graceful shut down`);

    // shut down anyway after `timeout` seconds
    if (timeout) {
      setTimeout(() => {
        console.error('could not finish in time, forcefully exiting');
        process.exit(1);
      }, timeout * 1000).unref();
    }

    // release resources
    let isError = false;
    for (const handler of closeHandlers) {
      try {
        await Promise.resolve(handler());
      } catch (err) {
        console.error('error happened during graceful shut down', err);
        isError = true;
      }
    }

    if (isError) {
      process.exit(1);
    }

    console.info('graceful shut down finished');
    process.kill(process.pid, signal);
  }
}
