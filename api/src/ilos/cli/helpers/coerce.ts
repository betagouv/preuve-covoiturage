import { InvalidArgumentError } from "dep:commander";

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

// Commander affiche l'InvalidArgumentError et arrête la commande.
export function coerceInt(s: string): number {
  if (!/^-?\d+$/.test(s)) {
    throw new InvalidArgumentError("Not an integer.");
  }
  return parseInt(s, 10);
}
