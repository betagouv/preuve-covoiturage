import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { ToastrService } from 'ngx-toastr';

import { CampaignStatus } from '~/core/entities/campaign/campaign-status';
import { Campaign } from '~/core/entities/campaign/campaign';
import { StatService } from '~/modules/stat/services/stat.service';
import { CampaignService } from '~/modules/campaign/services/campaign.service';
import { campaignMocks } from '~/modules/campaign/mocks/campaigns';

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
