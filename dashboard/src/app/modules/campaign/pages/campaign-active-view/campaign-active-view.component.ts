import { Component, OnInit } from '@angular/core';
import { take, takeUntil } from 'rxjs/operators';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { Territory } from '~/core/entities/territory/territory';
import { CampaignUx } from '~/core/entities/campaign/ux-format/campaign-ux';
import { CommonDataService } from '~/core/services/common-data.service';
import { DialogService } from '~/core/services/dialog.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { CampaignStoreService } from '~/modules/campaign/services/campaign-store.service';
import { Campaign } from '~/core/entities/campaign/api-format/campaign';

@Component({
  selector: 'app-campaign-active-view',
  templateUrl: './campaign-active-view.component.html',
  styleUrls: ['./campaign-active-view.component.scss'],
})
export class CampaignActiveViewComponent extends DestroyObservable implements OnInit {
  territory: Territory;
  campaignUx: CampaignUx;
  showSummary = false;

  constructor(
    private _authService: AuthenticationService,
    private _commonDataService: CommonDataService,
    private _dialog: DialogService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _campaignStoreService: CampaignStoreService,
    private _toastr: ToastrService,
  ) {
    super();
  }

  ngOnInit(): void {
    document.getElementsByClassName('AuthenticatedLayout-body')[0].scrollTop = 0;
    this._route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params: ParamMap) => {
      const notFound = !params.has('campaignId');
      if (notFound) {
        this._router.navigate(['/404']);
      } else {
        this.loadCampaign(Number(params.get('campaignId')));
      }
    });
  }

  get isLoading(): boolean {
    return !this.territory || !this.campaignUx;
  }

  get isLoggedAsTerritory(): boolean {
    return this._authService.hasAnyGroup([UserGroupEnum.TERRITORY]);
  }

  displaySummary(): void {
    this.showSummary = true;
  }

  private loadCampaign(campaignId: number): void {
    this._campaignStoreService
      .selectEntityByIdFromList(campaignId)
      .pipe(
        take(1),
        takeUntil(this.destroy$),
      )
      .subscribe(
        (campaign: Campaign) => {
          this.campaignUx = campaign.toFormValues();
          this.loadTerritory(campaign.territory_id);
        },
        (err) => {
          console.log('err : ', err);
          this._router.navigate(['/campaign']).then(() => {
            this._toastr.error("Les données de la campagne n'ont pas pu être chargées");
          });
        },
      );
    if (!this._campaignStoreService.loaded) {
      if (this._authService.user.group === UserGroupEnum.TERRITORY) {
        this._campaignStoreService.filterSubject.next({ territory_id: this._authService.user.territory_id });
      }
      this._campaignStoreService.loadList();
    }
  }

  private loadTerritory(id: number): void {
    const foundTerritory = this._commonDataService.territories.filter((territory) => territory._id === id)[0];
    if (foundTerritory) {
      this.territory = foundTerritory;
    } else {
      this._router.navigate(['/campaign']).then(() => {
        this._toastr.error("Les données du territoire de la campagne n'ont pas pu être chargées");
      });
    }
  }
}
