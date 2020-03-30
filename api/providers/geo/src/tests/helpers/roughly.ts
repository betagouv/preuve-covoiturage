export function roughly(value: number, target: number, percent = 5): boolean {
  const max = value * (1 + percent / 100);
  const min = value * (1 - percent / 100);

  return target >= min && target <= max;
}
