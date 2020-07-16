export function limit(input: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, input));
}

export function step(input: number, min: number, max: number): number {
  const limitedInput = limit(input, min, max);
  return (limitedInput - min) / (max - min);
}
