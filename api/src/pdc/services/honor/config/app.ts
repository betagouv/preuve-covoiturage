import { env } from "@/ilos/core/index.ts";

export const environment = env.or_fail("APP_ENV", "local");
