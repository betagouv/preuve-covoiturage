import { Format } from '@ilos/validator';
import { isValidBIC } from 'ibantools';

export const bicCustomFormat: Format = (data: string): boolean => {
  return isValidBIC(data);
}