interface INameToValueMap {
  [key: string]: any;
}

export function interceptConsole(
  logger: INameToValueMap,
  levels = ["log", "debug", "info", "warn", "error"],
) {
  const useLogger = (level: string) => {
    const log = (logger[level] ? logger[level] : logger.info).bind(logger);
    return (...args: Array<any>) => {
      if (args.length > 0) {
        if (typeof args[0] === "string" && typeof args[1] === "object") {
          log(args[1], args[0], ...args.slice(2));
        } else {
          log(args[0], ...args.slice(1));
        }
      } else {
        log(args[0]);
      }
    };
  };

  for (const level of levels) {
    Object.assign(console, {
      [level]: useLogger(level),
    });
  }
}
