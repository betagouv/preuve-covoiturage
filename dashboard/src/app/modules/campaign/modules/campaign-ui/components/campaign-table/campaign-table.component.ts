import { Component, Input, OnChanges } from '@angular/core';

import { PolicyInterface } from '~/shared/policy/common/interfaces/PolicyInterface';

enum DetailedStatus {
  Active = 'active',
  Consumed = 'consumed',
  Finished = 'finished',
  Draft = 'draft',
}

const detailedStatusDisplayedOrder: DetailedStatus[] = Object.values(DetailedStatus);

interface PolicyInterfaceWithStatus extends PolicyInterface {
  detailed_status: DetailedStatus;
}

@Component({
  selector: 'app-campaign-table',
  templateUrl: './campaign-table.component.html',
  styleUrls: ['./campaign-table.component.scss'],
})
export class CampaignTableComponent implements OnChanges {
  @Input() campaigns: PolicyInterface[];
  @Input() displayedColumns = ['detailed_status', 'start', 'end', 'name', 'territory', 'amount_spent', 'max_amount'];

  policies: PolicyInterfaceWithStatus[];

  private today: Date = new Date();

  constructor() {}
  ngOnChanges(): void {
    this.policies = this.campaigns
      .map((c) => ({
        ...c,
        detailed_status: this.computeStatus(c),
      }))
      .sort(
        (a, b) =>
          detailedStatusDisplayedOrder.indexOf(a.detailed_status) -
          detailedStatusDisplayedOrder.indexOf(b.detailed_status),
      );
  }

  centToEuro(amount: number): number {
    return amount / 100;
  }

  private computeStatus(policy: PolicyInterface): DetailedStatus {
    if (this.isConsumed(policy)) {
      return DetailedStatus.Consumed;
    } else if (this.isRunning(policy)) {
      return DetailedStatus.Active;
    } else if (this.isOver(policy)) {
      return DetailedStatus.Finished;
    } else {
      return DetailedStatus.Draft;
    }
  }

  private isRunning(campaign: PolicyInterface): boolean {
    return (
      campaign.status === 'active' &&
      new Date(campaign.end_date) > this.today &&
      new Date(campaign.start_date) < this.today
    );
  }

  private isConsumed(campaign: PolicyInterface): boolean {
    return campaign.status === 'active' && campaign.params && campaign.incentive_sum >= campaign.params.limits.glob;
  }

  private isOver(campaign: PolicyInterface): boolean {
    return campaign.status === 'finished' || (campaign.status === 'active' && new Date(campaign.end_date) < this.today);
  }
}
