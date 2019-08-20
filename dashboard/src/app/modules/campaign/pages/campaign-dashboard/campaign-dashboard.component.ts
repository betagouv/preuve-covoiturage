import { Component, OnInit } from '@angular/core';

import { ToastrService } from 'ngx-toastr';

import { CampaignStatus } from '~/core/entities/campaign/campaign-status';
import { Campaign } from '~/core/entities/campaign/campaign';
import { StatService } from '~/modules/stat/services/stat.service';
import { CampaignService } from '~/modules/campaign/services/campaign.service';

@Component({
  selector: 'app-campaign-dashboard',
  templateUrl: './campaign-dashboard.component.html',
  styleUrls: ['./campaign-dashboard.component.scss'],
})
export class CampaignDashboardComponent implements OnInit {
  campaigns: Campaign[];
  campaignStatus = CampaignStatus;

  constructor(
    public statService: StatService,
    public campaignService: CampaignService,
    private toastr: ToastrService,
  ) {}

  ngOnInit() {
    this.loadCampaigns();
  }

  getCampaignsByStatus(status: CampaignStatus) {
    return this.campaigns.filter((c: Campaign) => c.status === status);
  }

  private loadCampaigns(): void {
    this.campaignService.load().subscribe(
      (campaigns) => {
        this.campaigns = campaigns;
      },
      (err) => {
        this.toastr.error(err.message);

        // TODO TMP TO DELETE
        this.campaigns = [];
        for (let i = 0; i < 20; i = i + 1) {
          this.campaigns.push(this.generateCampaigns(i));
        }
      },
    );
  }

  private generateCampaigns(idx): any {
    const campaignToReturn: any = {};
    const randomStatus = Math.floor(Math.random() * Object.keys(CampaignStatus).length);
    campaignToReturn.status = CampaignStatus[Object.keys(CampaignStatus)[randomStatus]];
    campaignToReturn.name = `Name ${idx}`;
    campaignToReturn.description = `Description ${idx}`;
    campaignToReturn.start = new Date();
    campaignToReturn.end = new Date();
    campaignToReturn.max_trips = Math.floor(Math.random() * 10000);
    campaignToReturn.max_amount = Math.floor(Math.random() * 20000);
    campaignToReturn.trips_number = Math.floor(Math.random() * 10000);
    campaignToReturn.amount_spent = Math.floor(Math.random() * 20000);
    return campaignToReturn;
  }
}
