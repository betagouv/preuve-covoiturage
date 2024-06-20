export function coerceIntList(s: string): number[] {
  if (!s || !s.length) return [];
  return s
    .split(",")
    .map((i) => parseInt(i))
    .filter((i) => i && !isNaN(i));
}

export function coerceDate(s: string | null): Date | null {
  if (!s) return null;
  const d = new Date(s);
  if (d instanceof Date && !isNaN(d as unknown as number)) return d;
  return null;
}

export function coerceInt(s: string): number | undefined {
  const i = parseInt(s);
  if (isNaN(i)) {
    return undefined;
  }
  return i;
}
