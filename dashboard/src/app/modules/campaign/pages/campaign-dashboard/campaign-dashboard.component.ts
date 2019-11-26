import { Component, OnInit } from '@angular/core';
import { filter, map, takeUntil } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { CampaignService } from '~/modules/campaign/services/campaign.service';
import { CampaignUx } from '~/core/entities/campaign/ux-format/campaign-ux';
import { DestroyObservable } from '~/core/components/destroy-observable';

@Component({
  selector: 'app-campaign-dashboard',
  templateUrl: './campaign-dashboard.component.html',
  styleUrls: ['./campaign-dashboard.component.scss'],
})
export class CampaignDashboardComponent extends DestroyObservable implements OnInit {
  campaignStatus = CampaignStatusEnum;
  canCreateCampaign$: Observable<boolean>;
  campaigns: CampaignUx[];

  constructor(private authentificationService: AuthenticationService, private _campaignService: CampaignService) {
    super();
  }

  ngOnInit() {
    this.canCreateCampaign$ = this.authentificationService.user$.pipe(
      map((user) => user && this.authentificationService.hasAnyPermission(['incentive-campaign.create'])),
    );
    this.loadCampaigns();
  }

  private loadCampaigns(): void {
    this._campaignService.campaignsUx$
      .pipe(
        filter((campaigns) => !!campaigns),
        takeUntil(this.destroy$),
      )
      .subscribe((campaigns: CampaignUx[]) => {
        this.campaigns = campaigns;
      });
    if (this.loaded) {
      return;
    }
    this._campaignService
      .load()
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  private get loading(): boolean {
    return this._campaignService.loading;
  }

  private get loaded(): boolean {
    return this._campaignService.campaignsLoaded;
  }
}
