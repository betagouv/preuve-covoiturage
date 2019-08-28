import { Component, Input, OnInit } from '@angular/core';

import { Campaign } from '~/core/entities/campaign/campaign';
import { CampaignStatus, CampaignStatusFr } from '~/core/entities/campaign/campaign-status';
import { IncentiveUnit } from '~/core/entities/campaign/Incentive-unit';

@Component({
  selector: 'app-campaign-card',
  templateUrl: './campaign-card.component.html',
  styleUrls: ['./campaign-card.component.scss'],
})
export class CampaignCardComponent implements OnInit {
  @Input() campaign: Campaign;
  campaignStatus = CampaignStatus;
  campaignStatusFr = CampaignStatusFr;
  incentiveUnit = IncentiveUnit;

  constructor() {}

  ngOnInit() {}

  getCampaignClass(): string {
    let statusClass = 'CampaignCard-status';
    switch (this.campaign.status) {
      case CampaignStatus.VALIDATED:
        statusClass += '--validated';
        break;
      case CampaignStatus.ARCHIVED:
        statusClass += '--archived';
        break;
    }
    return statusClass;
  }
}
