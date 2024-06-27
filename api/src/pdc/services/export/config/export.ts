import { env } from "@/ilos/core/index.ts";

// default min start 3 years ago
export const minStartDefault = env.or_int(
  "APP_EXPORT_MIN_START",
  1000 * 60 * 60 * 24 * 365 * 3,
);

// max end is 5 days ago due to computation and validation time
export const maxEndDefault = env.or_int(
  "APP_EXPORT_MAX_END",
  1000 * 60 * 60 * 24 * 5,
);
