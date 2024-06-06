import { env } from '@/ilos/core/index.ts';

export const timeout = env.or_int('APP_REQUEST_TIMEOUT', 5000);
