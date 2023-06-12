import { Format } from '@ilos/validator';

export const CustomFormat: Format = (data: string): boolean => {
  try {
    // TODO check against a real list of INSEE codes?

    return /^[0-9][0-9A-B]{1}[0-9]{0,1}$/.test(data);
  } catch (e) {
    return false;
  }
};
