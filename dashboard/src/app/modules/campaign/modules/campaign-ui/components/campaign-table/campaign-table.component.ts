import { Component, Input } from '@angular/core';

import { PolicyInterface } from '~/shared/policy/common/interfaces/PolicyInterface';

@Component({
  selector: 'app-campaign-table',
  templateUrl: './campaign-table.component.html',
  styleUrls: ['./campaign-table.component.scss'],
})
export class CampaignTableComponent {
  @Input() campaigns: PolicyInterface[];
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

  centToEuro(amount: number): number {
    return amount / 100;
  }
}
