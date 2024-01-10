import { formatPhoneTrunc } from '../../lib/phone';

export function phonetruncCast(data: string): string {
  return formatPhoneTrunc(data);
}
