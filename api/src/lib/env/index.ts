export class EnvNotFoundException extends Error {}

export function env_or_int(k: string, fallback: number): number {
  const rawEnv = parseInt(Deno.env.get(k) ?? "", 10);
  return Number.isNaN(rawEnv) ? fallback : rawEnv;
}

export function env_or_false(k: string): boolean {
  return Deno.env.has(k) && Deno.env.get(k) === "true";
}

export function env_or_true(k: string): boolean {
  if (Deno.env.has(k)) {
    return Deno.env.get(k) === "true";
  }
  return true;
}

export function env_or_fail(k: string, fallback?: string): string {
  const val = Deno.env.has(k) ? Deno.env.get(k) : fallback;

  if (val === null || typeof val === "undefined") {
    throw new EnvNotFoundException(`Env key '${k}' not found`);
  }

  return val;
}

/**
 * Get the first key that is found in the environment variables
 * or return the fallback value.
 *
 * @param k key or ordered list of keys to look for
 * @param fallback default value if none of the keys are found
 * @returns
 */
export function env_or_default(k: string | string[], fallback: string): string {
  const keys = Array.isArray(k) ? k : [k];
  for (const key of keys) {
    if (Deno.env.has(key)) {
      const result = Deno.env.get(key);
      if (result !== undefined) {
        return result;
      }
    }
  }

  return fallback;
}

export function env(k: string): string | undefined {
  return Deno.env.get(k);
}

export function setEnv(k: string, value?: string) {
  if (!value) {
    Deno.env.delete(k);
  } else {
    Deno.env.set(k, value);
  }
}
