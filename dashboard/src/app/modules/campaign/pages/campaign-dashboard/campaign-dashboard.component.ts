import { Component, OnInit } from '@angular/core';
import { filter, map, takeUntil } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { CampaignUx } from '~/core/entities/campaign/ux-format/campaign-ux';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { CampaignStoreService } from '~/modules/campaign/services/campaign-store.service';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';

@Component({
  selector: 'app-campaign-dashboard',
  templateUrl: './campaign-dashboard.component.html',
  styleUrls: ['./campaign-dashboard.component.scss'],
})
export class CampaignDashboardComponent extends DestroyObservable implements OnInit {
  campaignStatus = CampaignStatusEnum;
  canCreateCampaign$: Observable<boolean>;
  campaigns: CampaignUx[];
  camSeeDraft$: Observable<boolean>;

  constructor(private _authService: AuthenticationService, private _campaignStoreService: CampaignStoreService) {
    super();
  }

  ngOnInit() {
    this.canCreateCampaign$ = this._authService.user$.pipe(
      map((user) => user && this._authService.hasAnyPermission(['incentive-campaign.create'])),
    );
    this.loadCampaigns();
  }

  private loadCampaigns(): void {
    this._campaignStoreService.campaignsUx$.pipe(takeUntil(this.destroy$)).subscribe((campaigns: CampaignUx[]) => {
      this.campaigns = campaigns;
    });
    if (this._authService.user.group === UserGroupEnum.TERRITORY) {
      this._campaignStoreService.filterSubject.next({ territory_id: this._authService.user.territory_id });
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
