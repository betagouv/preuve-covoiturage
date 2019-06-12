import { isValidBIC } from 'ibantools';

export function bicCustomFormat(data: string): boolean {
  return isValidBIC(data);
}
