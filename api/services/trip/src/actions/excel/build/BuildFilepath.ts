import { provider } from '@ilos/common';
import os from 'os';
import path from 'path';
import { v4 } from 'uuid';

@provider()
export class BuildFilepath {
  call(campaign_name: string, operator_id: number, start_date: Date): string {
    const startDatePlus6Days: Date = new Date(start_date.valueOf());
    startDatePlus6Days.setDate(startDatePlus6Days.getDate() + 6);
    return `${path.join(
      os.tmpdir(),
      `apdf-${this.sanitazeString(campaign_name)}-${operator_id}-${this.getMonthString(
        startDatePlus6Days,
      )}-${v4().substring(0, 6)}`,
    )}.xlsx`;
  }

  private sanitazeString(campaign_name: string): string {
    return campaign_name.toLowerCase().substring(0, 8).replace(/\ /g, '_');
  }

  private getMonthString(date: Date): string {
    return date
      .toLocaleString('fr-FR', { month: 'long' })
      .substring(0, 4)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
