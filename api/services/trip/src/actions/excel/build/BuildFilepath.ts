import { provider } from '@ilos/common';
import os from 'os';
import path from 'path';
import { v4 } from 'uuid';

@provider()
export class BuildFilepath {
  call(campaign_name: string, operator_id: number): string {
    return `${path.join(
      os.tmpdir(),
      `apdf-${this.sanitazeString(campaign_name)}-${operator_id}-${this.getMonthString()}-${v4().substring(0, 6)}`,
    )}.xlsx `;
  }

  private sanitazeString(campaign_name: string): string {
    return campaign_name.toLowerCase().substring(0, 8).replace(/\ /g, '_');
  }

  private getMonthString(): string {
    const currentDateMinusOneMonth: Date = new Date();
    currentDateMinusOneMonth.setMonth(currentDateMinusOneMonth.getMonth() - 3);
    return currentDateMinusOneMonth
      .toLocaleString('fr-FR', { month: 'long' })
      .substring(0, 4)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
