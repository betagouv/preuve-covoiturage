import { parsePhoneNumber, isValidPhoneNumber } from '@/deps.ts';

export function formatPhone(input: string): string {
  if (!input) {
    return input;
  }

  const phone = parsePhoneNumber(input, { defaultCountry: 'FR', extract: false });
  if (!phone) {
    return input;
  }
  return phone.format('E.164');
}

export function formatPhoneTrunc(input: string): string {
  if (!input) {
    return input;
  }
  const output = formatPhone(`${input}00`);
  return output.substr(0, output.length - 2);
}

export function isValidPhone(input: string): boolean {
  return isValidPhoneNumber(input, 'FR');
}

export function isValidPhoneTrunc(input: string): boolean {
  return isValidPhone(`${input}00`);
}
