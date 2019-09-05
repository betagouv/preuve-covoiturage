import { Component, OnInit } from '@angular/core';

import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';

@Component({
  selector: 'app-campaign-dashboard',
  templateUrl: './campaign-dashboard.component.html',
  styleUrls: ['./campaign-dashboard.component.scss'],
})
export class CampaignDashboardComponent implements OnInit {
  campaignStatus = CampaignStatusEnum;

  constructor() {}

  ngOnInit() {}
}
