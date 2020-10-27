export type period = 'day' | 'month' | 'campaign';

export function getMetaKey(base: string, inputDate: Date, period: period, scope: string): string {
  const date = typeof inputDate.getMonth === 'function' ? inputDate : new Date(inputDate);
  const [day, month, year] = [date.getDate(), date.getMonth(), date.getFullYear()];

  let keyPeriod = 'global';
  switch (period) {
    case 'day':
      keyPeriod = `${day}-${month}-${year}`;
      break;
    case 'month':
      keyPeriod = `${month}-${year}`;
      break;
  }

  return `${base}.${scope}.${period}.${keyPeriod}`;
}
