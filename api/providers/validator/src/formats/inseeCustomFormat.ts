export function inseeCustomFormat(data: string): boolean {
  try {
    // TODO check against a real list of INSEE codes?

    return /^[0-9][0-9A-B][0-9]{3}$/.test(data);
  } catch (e) {
    return false;
  }
}
