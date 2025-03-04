import { exists, read } from "@/lib/file/index.ts";
import { compare, genSalt, hash } from "dep:bcrypt";
import * as stdCrypto from "dep:crypto";
import { decodeBase64, encodeBase64, encodeHex } from "dep:encoding";

export async function bcrypt_hash(
  plaintext: string,
  round: number = 10,
): Promise<string> {
  const salt = await genSalt(round);
  return await hash(plaintext, salt);
}

export async function bcrypt_compare(
  plaintext: string,
  hash: string,
): Promise<boolean> {
  return await compare(plaintext, hash);
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

/**
 * Create a hash from a string
 *
 * ```ts
 * const hash = await createHash("Hello World");
 * ```
 *
 * @param message
 * @returns
 */
export async function createHash(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

export async function sha256sum(source: string | ReadableStream<Uint8Array>): Promise<string> {
  return shaSum(source, "SHA-256");
}

export async function sha1sum(source: string | ReadableStream<Uint8Array>): Promise<string> {
  return shaSum(source, "SHA-1");
}

export async function shaSum(
  source: string | ReadableStream<Uint8Array>,
  alg: stdCrypto.DigestAlgorithm = "SHA-256",
): Promise<string> {
  let stream;
  if (source instanceof ReadableStream) {
    stream = source;
  } else {
    if (!await exists(source)) {
      throw new Error(`File not found: ${source}`);
    }

    const file = await read(source);
    stream = file.readable;
  }

  const hashBuffer = await stdCrypto.crypto.subtle.digest(alg, stream);
  return encodeHex(hashBuffer);
}
