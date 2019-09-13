import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { CampaignService } from '~/modules/campaign/services/campaign.service';
import { IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';
import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';
import { CampaignUx } from '~/core/entities/campaign/campaign-ux';

@Component({
  selector: 'app-campaign-discover',
  templateUrl: './campaign-discover.component.html',
  styleUrls: ['./campaign-discover.component.scss'],
})
export class CampaignDiscoverComponent implements OnInit {
  campaigns: CampaignUx[];
  campaignsToShow: CampaignUx[];

  constructor(public campaignService: CampaignService, private toastr: ToastrService) {}

  ngOnInit() {
    this.loadCampaigns();
  }

  onMapResize($event) {
    this.campaignsToShow = this.campaigns.filter((c: CampaignUx) => {
      // todo: get coordinates from territory
      let territoryCoords;
      switch (Number(c.territory_id)) {
        case 0:
          territoryCoords = [5.36978, 43.296482];
          break;
        case 1:
          territoryCoords = [4.835659, 45.764043];
          break;
        case 2:
          territoryCoords = [2.3522219, 48.856614];
          break;
      }
      return (
        $event[0] <= territoryCoords[0] &&
        $event[2] >= territoryCoords[0] &&
        $event[1] <= territoryCoords[1] &&
        $event[3] >= territoryCoords[1]
      );
    });
  }

  private loadCampaigns(): void {
    this.campaignService.load().subscribe(
      (campaigns) => {
        this.campaigns = campaigns.map(this.campaignService.toCampaignUxFormat);
        this.campaignsToShow = this.campaigns;
      },
      (err) => {
        this.toastr.error(err.message);

        // TODO TMP TO DELETE
        this.campaigns = [];
        for (let i = 0; i < 30; i = i + 1) {
          this.campaigns.push(this.generateCampaigns(i));
        }
        this.campaignsToShow = this.campaigns;
      },
    );
  }

  private generateCampaigns(idx): any {
    const campaignToReturn: any = {};
    const randomStatus = Math.floor(Math.random() * Object.keys(CampaignStatusEnum).length);
    campaignToReturn.status = CampaignStatusEnum[Object.keys(CampaignStatusEnum)[randomStatus]];
    campaignToReturn.name = `Name ${idx}`;
    campaignToReturn.description = `Description ${idx}`;
    campaignToReturn.start = new Date();
    campaignToReturn.end = new Date();
    campaignToReturn.max_trips = Math.floor(Math.random() * 10000);
    campaignToReturn.max_amount = Math.floor(Math.random() * 20000);
    campaignToReturn.trips_number = Math.floor(Math.random() * 10000);
    campaignToReturn.amount_spent = Math.floor(Math.random() * 20000);
    campaignToReturn.territory = Math.floor(Math.random() * 3);
    campaignToReturn.territory_id = Math.floor(Math.random() * 3);
    campaignToReturn.unit = [IncentiveUnitEnum.EUR, IncentiveUnitEnum.POINT][Math.floor(Math.random() * 2)];
    campaignToReturn.territory.name = 'Communauté d’Agglomération du Pays de Gex';
    return campaignToReturn;
  }
}
