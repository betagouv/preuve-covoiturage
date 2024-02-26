import { ConfigInterface } from '@ilos/common';
import { CronFrequency, MatviewItem, CronFrequencies } from '../interfaces/StatsRefreshInterfaces';

export function filterTables(
  config: ConfigInterface,
  frequencies: CronFrequency[],
  schema: string,
  rows: MatviewItem[],
): string[] {
  const toSkip = config.get<Set<string>>('refresh.skip', new Set());
  return rows
    .map((t: MatviewItem) => t.matviewname)
    .filter((table: string) => !toSkip.has(`${schema}.${table}`))
    .map((table: string) => {
      const [freq] = table.split('_', 1);
      return {
        table,
        freq: CronFrequencies.indexOf(freq as CronFrequency) > -1 ? freq : 'daily',
      };
    })
    .filter(({ freq }) => frequencies.indexOf(freq as CronFrequency) > -1)
    .map(({ table }: { table: string }) => table);
}
