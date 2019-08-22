import { Component, OnInit } from '@angular/core';
import { CampaignService } from '~/modules/campaign/services/campaign.service';
import { Campaign } from '~/core/entities/campaign/campaign';
import { ToastrService } from 'ngx-toastr';
import { CampaignStatus } from '~/core/entities/campaign/campaign-status';

@Component({
  selector: 'app-campaign-discover',
  templateUrl: './campaign-discover.component.html',
  styleUrls: ['./campaign-discover.component.scss'],
})
export class CampaignDiscoverComponent implements OnInit {
  campaigns: Campaign[];

  constructor(public campaignService: CampaignService, private toastr: ToastrService) {}

  ngOnInit() {
    this.loadCampaigns();
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
        for (let i = 0; i < 30; i = i + 1) {
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
    campaignToReturn.territory = {};
    campaignToReturn.territory.name = 'Communauté d’Agglomération du Pays de Gex';
    return campaignToReturn;
  }
}
