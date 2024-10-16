export function v4() {
  return crypto.randomUUID();
}

export function randomString(
  length: number = 64,
  charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.",
): string {
  const randomBytes = new Uint8Array(length);
  crypto.getRandomValues(randomBytes);

  const randomString = Array.from(
    randomBytes,
    (byte) => charset.charAt(byte % charset.length),
  ).join("");

  return randomString;
}
