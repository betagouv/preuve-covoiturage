import { PhoneNumberUtil, PhoneNumber, PhoneNumberFormat } from 'google-libphonenumber';

export function phoneCast({ data }: { data: string }): string {
  if (!data) {
    return data;
  }

  try {
    const clean = data.replace(/ /g, '');

    const phoneUtil: PhoneNumberUtil = PhoneNumberUtil.getInstance();
    const phone: PhoneNumber = phoneUtil.parseAndKeepRawInput(clean, clean.substr(0, 1) === '+' ? null : 'FR');

    return phoneUtil.format(phone, PhoneNumberFormat.E164);
  } catch (e) {
    return data;
  }
}
