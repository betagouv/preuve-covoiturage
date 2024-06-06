import { Format } from '@/ilos/validator/index.ts';
import { isValidBIC } from '@/deps.ts';

export const bicCustomFormat: Format = (data: string): boolean => {
  return isValidBIC(data);
};
