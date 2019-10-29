export function objectidCustomFormat(data: string): boolean {
  return /^[a-f\d]{24}$/i.test(data);
}
