import { formatPhone } from '../../lib/phone';

export function phoneCast(data: string): string {
  return formatPhone(data);
}
