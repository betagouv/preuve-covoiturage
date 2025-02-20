import { env_or_default } from "@/lib/env/index.ts";
import * as log from "dep:log";

const level = env_or_default("APP_LOG_LEVEL", "DEBUG").toUpperCase() as log.LevelName;

const consoleHandler = new log.ConsoleHandler(
  level,
  {
    formatter: log.formatters.jsonFormatter,
    useColors: false,
  },
);

log.setup({ handlers: { default: consoleHandler } });

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
