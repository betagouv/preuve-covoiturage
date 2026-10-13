import { env_or_default } from "@/lib/env/index.ts";
import * as log from "dep:log";

export function setupLogger(level: log.LevelName): void {
  const consoleHandler = new log.ConsoleHandler(level, {
    formatter: log.formatters.jsonFormatter,
    useColors: false,
  });

  // Sans `loggers`, std/log garde le logger par défaut en INFO et ignore tout debug.
  log.setup({
    handlers: { default: consoleHandler },
    loggers: { default: { level, handlers: ["default"] } },
  });
}

setupLogger(env_or_default("APP_LOG_LEVEL", "INFO").toUpperCase() as log.LevelName);

export const getPerformanceTimer = () => {
  const start = performance.now();
  return {
    stop: () => {
      return performance.now() - start;
    },
  };
};

const { info, warn, debug, error } = log;

export const logger = {
  debug,
  error,
  info,
  warn,
  log: debug,
};
