import { isNumber } from 'lodash';

export function inseeCast({ data }: { data: string | number }): string {
  if (!data) {
    throw new Error('Invalid INSEE code');
  }

  const insee = isNumber(data) && data < 10000 ? `0${data}` : data;

  return insee
    .toString()
    .replace(/[^0-9a-z]/gi, '')
    .substr(0, 5)
    .toUpperCase();
}
