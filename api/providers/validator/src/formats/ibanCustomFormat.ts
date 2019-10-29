import { isValidIBAN } from 'ibantools';

export function ibanCustomFormat(data: string): boolean {
  return isValidIBAN(data);
}
