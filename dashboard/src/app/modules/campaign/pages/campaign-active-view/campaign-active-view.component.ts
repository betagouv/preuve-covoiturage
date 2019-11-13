import { Component, OnInit } from '@angular/core';
import { filter, takeUntil } from 'rxjs/operators';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { Campaign } from '~/core/entities/campaign/api-format/campaign';
import { Territory } from '~/core/entities/territory/territory';
import { CampaignUx } from '~/core/entities/campaign/ux-format/campaign-ux';
import { CommonDataService } from '~/core/services/common-data.service';
import { DialogService } from '~/core/services/dialog.service';
import { CampaignService } from '~/modules/campaign/services/campaign.service';
import { CampaignFormatingService } from '~/modules/campaign/services/campaign-formating.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';

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
    private _campaignService: CampaignService,
    private _campaignFormatService: CampaignFormatingService, // todo: refactor, this should not be need,
    private _toastr: ToastrService,
  ) {
    super();
  }

  ngOnInit() {
    document.getElementsByClassName('AuthenticatedLayout-body')[0].scrollTo(0, 0);
    this._route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params: ParamMap) => {
      const notFound = !params.has('campaignId');
      if (notFound) {
        this._router.navigate(['/404']);
      } else {
        this.loadCampaign(params.get('campaignId'));
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

  private loadCampaign(campaignId: string) {
    if (!this._campaignService.campaignsLoaded) {
      this._campaignService
        .load()
        .pipe(takeUntil(this.destroy$))
        .subscribe();
    }
    this._campaignService.entities$
      .pipe(
        filter((campaigns) => campaigns.length > 0),
        takeUntil(this.destroy$),
      )
      .subscribe((campaigns: Campaign[]) => {
        const foundCampaign = campaigns.filter((campaign) => campaign._id === campaignId)[0];
        if (foundCampaign) {
          this.campaignUx = this._campaignFormatService.toCampaignUxFormat(foundCampaign);
          this.loadTerritory(foundCampaign.territory_id);
        } else {
          this._router.navigate(['/campaign']).then(() => {
            this._toastr.error("Les données de la campagne n'ont pas pu être chargées");
          });
        }
      });
  }

  private loadTerritory(id: string) {
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
