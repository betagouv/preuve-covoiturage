import { provider } from '@ilos/common';
import os from 'os';
import path from 'path';
import { v4 } from 'uuid';
import { ResultInterface as Campaign } from '~/shared/policy/find.contract';

@provider()
export class BuildFilepath {
  /**
   * Build a filename with a specific scheme for a funding request
   * @returns 'apdf-${operator_id}-${campaign_id}-${sanitized_campaign_name}-{$cap}-${month_string}-${truncated_uuid}'
   */
  call(campaign: Campaign, operator_id: number, start_date: Date): string {
    const { _id: policy_id, name, territory_id } = campaign;

    const startDatePlus6Days: Date = new Date(start_date.valueOf());
    startDatePlus6Days.setDate(startDatePlus6Days.getDate() + 6);
    const month = this.getMonthString(startDatePlus6Days);

    return `${path.join(
      os.tmpdir(),
      `apdf-${operator_id}-${territory_id}-${this.sanitizeString(name)}-${month}-${v4().substring(0, 6)}`,
    )}.xlsx`;
  }

  private sanitizeString(campaign_name: string): string {
    return campaign_name.toLowerCase().substring(0, 8).replace(/\ /g, '_').replace('-', '_');
  }

  private getMonthString(date: Date): string {
    return date
      .toLocaleString('fr-FR', { month: 'long' })
      .substring(0, 4)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
