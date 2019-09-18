import { Component, Input, OnInit } from '@angular/core';

import { Campaign } from '~/core/entities/campaign/campaign';
import { IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';
import { CAMPAIGN_STATUS_FR, CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';

@Component({
  selector: 'app-campaign-card',
  templateUrl: './campaign-card.component.html',
  styleUrls: ['./campaign-card.component.scss'],
})
export class CampaignCardComponent implements OnInit {
  @Input() campaign: Campaign;
  campaignStatus = CampaignStatusEnum;
  CAMPAIGN_STATUS_FR = CAMPAIGN_STATUS_FR;
  incentiveUnit = IncentiveUnitEnum;

  constructor() {}

  ngOnInit() {}

  getTerritoryLabel(territoryId: string): string {
    //    todo:
    return 'territory';
  }

  getCampaignClass(): string {
    let statusClass = 'CampaignCard-status';
    switch (this.campaign.status) {
      case CampaignStatusEnum.VALIDATED:
        statusClass += '--validated';
        break;
      case CampaignStatusEnum.ARCHIVED:
        statusClass += '--archived';
        break;
    }
    return statusClass;
  }
}
