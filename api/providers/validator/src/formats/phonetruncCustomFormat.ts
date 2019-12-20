import { phoneCustomFormat } from './phoneCustomFormat';

/**
 * Append 00 to the phone number and validate it with the 'phone' format
 */
export function phonetruncCustomFormat(data: string): boolean {
  return phoneCustomFormat(`${data}00`);
}
