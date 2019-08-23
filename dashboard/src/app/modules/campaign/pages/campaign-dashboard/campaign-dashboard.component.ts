import { Component, OnInit } from '@angular/core';

import { CampaignStatus } from '~/core/entities/campaign/campaign-status';

@Component({
  selector: 'app-campaign-dashboard',
  templateUrl: './campaign-dashboard.component.html',
  styleUrls: ['./campaign-dashboard.component.scss'],
})
export class CampaignDashboardComponent implements OnInit {
  campaignStatus = CampaignStatus;

  constructor() {}

  ngOnInit() {}
}
