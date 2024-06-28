import { bcrypt, decodeBase64, encodeBase64 } from "@/deps.ts";
export async function bcrypt_hash(
  plaintext: string,
  round: number = 10,
): Promise<string> {
  const salt = await bcrypt.genSalt(round);
  return await bcrypt.hash(plaintext, salt);
}

export async function bcrypt_compare(
  plaintext: string,
  hash: string,
): Promise<boolean> {
  return await bcrypt.compare(plaintext, hash);
}

export async function createSignatory(
  privateKeyPem: string,
): Promise<(message: string) => Promise<string>> {
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = privateKeyPem.substring(
    pemHeader.length,
    privateKeyPem.length - pemFooter.length - 1,
  );
  const privateKeyRaw = decodeBase64(pemContents);

  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    privateKeyRaw,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: { name: "SHA-512" },
    },
    false,
    ["sign"],
  );

  return async (message: string) => {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(message);

    const signature = await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      privateKey,
      dataBuffer,
    );

    return encodeBase64(new Uint8Array(signature));
  };
}

export async function createHash(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}
