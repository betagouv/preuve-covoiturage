import { CronFrequency } from '../interfaces/StatsRefreshInterfaces';

export function todayFrequencies(d?: Date | string): CronFrequency[] {
  const freq: CronFrequency[] = ['daily'];
  const now = new Date(d || new Date());

  // on Mondays
  if (now.getDay() === 1) freq.push('weekly');

  // on first day of the month
  if (now.getDate() === 1) freq.push('monthly');

  return freq;
}
