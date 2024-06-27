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
export function env_or_default(k: string, fallback: string): string {
  return Deno.env.get(k) ?? fallback;
}

export function env(k: string): string | undefined {
  return Deno.env.get(k);
}
