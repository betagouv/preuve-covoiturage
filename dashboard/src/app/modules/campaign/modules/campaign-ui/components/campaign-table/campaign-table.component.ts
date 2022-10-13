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

  isRunning(campaign: PolicyInterface): boolean {
    const today = new Date();
    return campaign.status === 'active' && new Date(campaign.end_date) > today && new Date(campaign.start_date) < today;
  }

  isOver(campaign: PolicyInterface): boolean {
    const today = new Date();
    return campaign.status === 'finished' || (campaign.status === 'active' && new Date(campaign.end_date) < today);
  }
}
