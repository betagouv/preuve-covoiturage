import { takeUntil } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';

import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';
import { AuthenticationService as Auth } from '~/core/services/authentication/authentication.service';
import { CampaignUx } from '~/core/entities/campaign/ux-format/campaign-ux';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { CampaignStoreService } from '~/modules/campaign/services/campaign-store.service';
import { Groups } from '~/core/enums/user/groups';
import { Roles } from '~/core/enums/user/roles';

@Component({
  selector: 'app-campaign-dashboard',
  templateUrl: './campaign-dashboard.component.html',
  styleUrls: ['./campaign-dashboard.component.scss'],
})
export class CampaignDashboardComponent extends DestroyObservable implements OnInit {
  campaignStatus = CampaignStatusEnum;
  canCreate: boolean;
  canSeeDrafts: boolean;
  canSeeDemoCaption: boolean;
  campaigns: CampaignUx[];
  outdatedCampaign: CampaignUx[];
  currentCampaigns: CampaignUx[];

  constructor(private auth: Auth, private _campaignStoreService: CampaignStoreService) {
    super();
  }

  ngOnInit(): void {
    this.canCreate = this.auth.isSuperAdmin() || this.auth.hasRole([Roles.TerritoryAdmin, Roles.TerritoryDemo]);
    this.canSeeDrafts = this.canCreate;
    this.canSeeDemoCaption = this.auth.hasRole(Roles.TerritoryDemo);

    this.loadCampaigns();
  }

  private loadCampaigns(): void {
    this._campaignStoreService.campaignsUx$.pipe(takeUntil(this.destroy$)).subscribe((campaigns: CampaignUx[]) => {
      this.campaigns = campaigns;

      this.outdatedCampaign = [];
      this.currentCampaigns = [];

      const now = new Date().getTime();

      this.campaigns.forEach((c) => {
        if (c.status !== CampaignStatusEnum.DRAFT) {
          if (c.end.toDate().getTime() > now) {
            this.currentCampaigns.push(c);
          } else {
            this.outdatedCampaign.push(c);
          }
        }
      });
    });
    if (this.auth.user.group === Groups.Territory) {
      this._campaignStoreService.filterSubject.next({ territory_id: this.auth.user.territory_id });
    }
    this._campaignStoreService.loadList();
  }

  get loading(): boolean {
    return this._campaignStoreService.isLoading;
  }

  get loaded(): boolean {
    return !!this.campaigns;
  }
}
