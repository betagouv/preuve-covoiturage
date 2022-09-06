import { Component, Input } from '@angular/core';

import { PolicyInterface } from '~/shared/policy/common/interfaces/PolicyInterface';
import { IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';

@Component({
  selector: 'app-campaign-table',
  templateUrl: './campaign-table.component.html',
  styleUrls: ['./campaign-table.component.scss'],
})
export class CampaignTableComponent {
  @Input() campaigns: PolicyInterface[];
  @Input() displayedColumns = [
    // 'status',
    'start',
    'end',
    'name',
    'territory',
    // 'amount_spent',
    // 'max_amount',
    // 'trips_number',
    // 'max_trips',
  ];

  constructor() {}

  isEuro(unit: IncentiveUnitEnum): boolean {
    return unit === IncentiveUnitEnum.EUR;
  }
}
