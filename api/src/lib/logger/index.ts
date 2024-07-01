import { log } from "@/deps.ts";
import { env_or_default } from "@/lib/env/index.ts";

log.setup({
  handlers: {
    default: new log.ConsoleHandler(
      env_or_default("LOG_LEVEL", "DEBUG") as log.LevelName,
      {
        formatter: log.formatters.jsonFormatter,
        useColors: false,
      },
    ),
  },
});

export function getPerformanceTimer() {
  const start = performance.now();
  return {
    stop: () => {
      return performance.now() - start;
    },
  };
}

const { info, warn, debug, error } = log;

export const logger = {
  debug,
  error,
  info,
  warn,
  log: (...args: unknown[]) => debug(...args),
};
