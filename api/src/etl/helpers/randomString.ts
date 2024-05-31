import { randomBytes, createHash } from 'node:crypto';

export function randomString(length = 16): string {
  return randomBytes(length).toString('hex').substr(0, length);
}

export function hash(data: string): string {
  return createHash('md5').update(data).digest('hex');
}
