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

export function envs_or_default(k: string[], fallback: string): string {
  for (const key of k) {
    if (Deno.env.has(key)) {
      const result = Deno.env.get(key);
      if (result !== undefined) {
        return result;
      }
    }
  }
  return fallback;
}

export function env_or_default(k: string, fallback: string): string {
  return Deno.env.get(k) ?? fallback;
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
