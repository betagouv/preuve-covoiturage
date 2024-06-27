import { env_or_default } from "@/lib/env/index.ts";
import * as log from "https://deno.land/std@0.224.0/log/mod.ts";

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

export const logger = { debug, error, info, warn };
