import { EnvNotFoundException } from '../exceptions/index.ts';
import { process } from '@/deps.ts';

export function or_int(k: string, fallback: number): number {
  const rawEnv = parseInt(process.env[k], 10);
  return Number.isNaN(rawEnv) ? fallback : rawEnv;
}

export function or_false(k: string): boolean {
  return k in process.env && process.env[k] === 'true';
}

export function or_true(k: string): boolean {
  if (k in process.env) return process.env[k] === 'true';
  return true;
}

export function or_fail(k: string, fallback?: string): string {
  const val = k in process.env ? process.env[k] : fallback;

  if (val === null || typeof val === 'undefined') {
    throw new EnvNotFoundException(`Env key '${k}' not found`);
  }

  return val;
}
