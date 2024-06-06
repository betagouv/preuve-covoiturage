import { Format } from '/ilos/validator/index.ts';
import { isValidBIC } from 'ibantools';

export const bicCustomFormat: Format = (data: string): boolean => {
  return isValidBIC(data);
};
