import { env } from "@/ilos/core/index.ts";

export const defaultTz = 'Europe/Paris';
export const environment = env.or_fail('APP_ENV', 'local');
