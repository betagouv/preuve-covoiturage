import { of } from 'rxjs';
import { bufferTime, concatMap, map, take, takeUntil } from 'rxjs/operators';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { Territory } from '~/core/entities/territory/territory';
import { CampaignUx } from '~/core/entities/campaign/ux-format/campaign-ux';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { CampaignStoreService } from '~/modules/campaign/services/campaign-store.service';
import { Campaign } from '~/core/entities/campaign/api-format/campaign';
import { TerritoryApiService } from '~/modules/territory/services/territory-api.service';

@Component({
  selector: 'app-campaign-active-view',
  templateUrl: './campaign-active-view.component.html',
  styleUrls: ['./campaign-active-view.component.scss'],
})
export class CampaignActiveViewComponent extends DestroyObservable implements OnInit {
  territory: Territory;
  campaignUx: CampaignUx;
  showSummary = false;
  isLoaded = false;

  get isLoggedAsTerritory(): boolean {
    return this._authService.hasAnyGroup([UserGroupEnum.TERRITORY]);
  }

  constructor(
    private _route: ActivatedRoute,
    private _authService: AuthenticationService,
    private _territoryApi: TerritoryApiService,
    private _campaignStoreService: CampaignStoreService,
  ) {
    super();
  }

  ngOnInit(): void {
    this._route.paramMap
      .pipe(
        // race condition on page load...
        bufferTime(500),
        take(1),
        map((list) => list[0]),
        // get the id from URL params
        concatMap((params: ParamMap) => of(Number(params.get('campaignId')))),
        // fetch the campaign
        concatMap((_id: number) => this._campaignStoreService.getById(_id)),
        // set the local var with a mapped version of the data
        // and pass its territory_id on
        concatMap((campaign: Campaign) => {
          this.campaignUx = new CampaignUx(campaign.toFormValues());
          return of(campaign.territory_id);
        }),
        // fetch the territory data
        concatMap((_id) => this._territoryApi.find({ _id })),
        takeUntil(this.destroy$),
      )
      .subscribe((territory) => {
        this.territory = territory;
        this.isLoaded = true;
      });
  }
}
