export function env(key: string, fallback?: string): string {
  const val = Deno.env.get(key);

  if (val === undefined) {
    if (fallback === undefined) {
      throw new Error(`Missing environment variable: ${key}`);
    }

    return fallback;
  }

  return val;
}
