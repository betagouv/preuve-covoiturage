import { PhoneNumberUtil, PhoneNumber, PhoneNumberFormat } from 'google-libphonenumber';

export function phonetruncCast({ data }: { data: string }): string {
  if (!data) {
    return data;
  }

  try {
    const leading = `${data.replace(/ /g, '')}00`;
    const phoneUtil: PhoneNumberUtil = PhoneNumberUtil.getInstance();
    const phone: PhoneNumber = phoneUtil.parseAndKeepRawInput(leading, leading.substr(0, 1) === '+' ? null : 'FR');
    const e164 = phoneUtil.format(phone, PhoneNumberFormat.E164);

    return e164.substr(0, e164.length - 2);
  } catch (e) {
    return data;
  }
}
