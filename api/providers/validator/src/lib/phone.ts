import { PhoneNumberUtil, PhoneNumber, PhoneNumberFormat } from 'google-libphonenumber';
export function formatPhone(input: string): string {
  if (!input) {
    return input;
  }

  try {
    const clean = input.replace(/ /g, '');

    const phoneUtil: PhoneNumberUtil = PhoneNumberUtil.getInstance();
    const phone: PhoneNumber = phoneUtil.parseAndKeepRawInput(clean, clean.substr(0, 1) === '+' ? null : 'FR');

    return phoneUtil.format(phone, PhoneNumberFormat.E164);
  } catch (e) {
    return input;
  }
}

export function formatPhoneTrunc(input: string): string {
  if (!input) {
    return input;
  }
  const output = formatPhone(`${input}00`);
  return output.substr(0, output.length - 2);
}

export function isValidPhone(input: string): boolean {
  try {
    const phoneUtil: PhoneNumberUtil = PhoneNumberUtil.getInstance();
    const phone: PhoneNumber = phoneUtil.parseAndKeepRawInput(input, input.substr(0, 1) === '+' ? null : 'FR');

    return phoneUtil.isValidNumber(phone);
  } catch (e) {
    return false;
  }
}

export function isValidPhoneTrunc(input: string): boolean {
  return isValidPhone(`${input}00`);
}
