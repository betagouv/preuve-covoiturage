import { Component, Input } from '@angular/core';

import { IncentiveCampaign } from '~/entities/database/Incentive/incentiveCampaign';

@Component({
  selector: 'app-incentive-campaign-summary',
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})
export class IncentiveCampaignSummaryComponent {
  @Input() campaign: IncentiveCampaign;
}
