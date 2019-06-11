export function postcodeCustomFormat(data: string): boolean {
  try {
    return /^[0-9][0-9A-B][0-9]{3}$/.test(data);
  } catch (e) {
    return false;
  }
}
