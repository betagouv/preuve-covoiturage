import { formatPhone } from '../../lib/phone.ts';

export function phoneCast(data: string): string {
  return formatPhone(data);
}
