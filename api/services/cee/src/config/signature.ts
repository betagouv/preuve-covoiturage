import { env } from '@ilos/core';
import { readFileSync } from 'fs';

export const public_key = env('APP_CEE_PUBLIC_KEY', readFileSync(env('APP_CEE_PUBLIC_KEY_PATH') as string, 'utf-8'));
export const private_key = env('APP_CEE_PRIVATE_KEY', readFileSync(env('APP_CEE_PRIVATE_KEY_PATH') as string, 'utf-8'));
