import { hash as argonHash } from 'argon2';

export async function hash(data: string): Promise<string> {
  return argonHash(data);
}
