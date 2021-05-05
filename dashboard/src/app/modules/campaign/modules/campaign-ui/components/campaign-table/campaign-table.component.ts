import { Component, Input } from '@angular/core';

import { CampaignUx } from '~/core/entities/campaign/ux-format/campaign-ux';
import { IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';

@Component({
  selector: 'app-campaign-table',
  templateUrl: './campaign-table.component.html',
  styleUrls: ['./campaign-table.component.scss'],
})
export class CampaignTableComponent {
  @Input() campaigns: CampaignUx[];
  @Input() displayedColumns = [
    'status',
    'start',
    'end',
    'name',
    'territory',
    // 'amount_spent',
    'max_amount',
    // 'trips_number',
    // 'max_trips',
  ];

  constructor() {}

  isEuro(unit: IncentiveUnitEnum): boolean {
    return unit === IncentiveUnitEnum.EUR;
  }
}
