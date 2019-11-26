import { Component, OnInit } from '@angular/core';
import { map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { merge, Observable } from 'rxjs';

import { CampaignUx } from '~/core/entities/campaign/ux-format/campaign-ux';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { CampaignService } from '~/modules/campaign/services/campaign.service';
import { CAMPAIGN_STATUS_FR, CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';

@Component({
  selector: 'app-campaign-admin-list',
  templateUrl: './campaign-admin-list.component.html',
  styleUrls: ['./campaign-admin-list.component.scss'],
})
export class CampaignAdminListComponent extends DestroyObservable implements OnInit {
  filteredCampaigns: CampaignUx[];
  campaigns: CampaignUx[];
  selectedStatus = CampaignStatusEnum.VALIDATED;
  allStatus = [
    CampaignStatusEnum.VALIDATED,
    CampaignStatusEnum.ARCHIVED,
    CampaignStatusEnum.DRAFT,
    CampaignStatusEnum.PENDING,
  ];

  constructor(private _campaignService: CampaignService) {
    super();
  }

  ngOnInit() {
    this.loadCampaigns();
  }

  private loadCampaigns(): void {
    merge(
      this._campaignService.campaignsUx$.pipe(
        tap((campaigns: CampaignUx[]) => (this.campaigns = campaigns)),
        takeUntil(this.destroy$),
      ),
    )
      .pipe(map(() => this.campaigns))
      .subscribe((campaigns) => {
        this.filteredCampaigns = campaigns;
      });
    if (this._campaignService.campaignsLoaded) {
      return;
    }
    this._campaignService
      .load()
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  get loading(): boolean {
    return this._campaignService.loading;
  }

  get loaded(): boolean {
    return this._campaignService.loaded;
  }

  getFrenchStatus(status: CampaignStatusEnum): string {
    return CAMPAIGN_STATUS_FR[status];
  }
}
