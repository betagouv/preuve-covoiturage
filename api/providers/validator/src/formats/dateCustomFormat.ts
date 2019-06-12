export function dateCustomFormat(data: string): boolean {
  const d = new Date(data);

  return d instanceof Date && d.toString() !== 'Invalid Date' && !isNaN(d as any);
}
