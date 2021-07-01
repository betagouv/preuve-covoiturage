export function getParams(params: { [k: string]: string } = {}): string {
  return Object.entries(params)
    .filter(([k, v]: [string, string]) => v?.length)
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join('&');
}
