import { of } from 'rxjs';
// import { ToastrService } from 'ngx-toastr';
import { switchMap, takeUntil, tap } from 'rxjs/operators';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

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

  constructor(
    private _authService: AuthenticationService,
    private _territoryApi: TerritoryApiService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _campaignStoreService: CampaignStoreService, // private _toastr: ToastrService,
  ) {
    super();
  }

  ngOnInit(): void {
    document.getElementsByClassName('AuthenticatedLayout-body')[0].scrollTop = 0;
    this._route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params: ParamMap) => {
      if (params.has('campaignId')) {
        setTimeout(() => {
          this.loadCampaign(Number(params.get('campaignId')));
        }, 1000);
      } else {
        this._router.navigate(['/404']);
      }
    });
  }

  get isLoggedAsTerritory(): boolean {
    return this._authService.hasAnyGroup([UserGroupEnum.TERRITORY]);
  }

  private loadCampaign(campaignId: number): void {
    this._campaignStoreService
      .getById(campaignId)
      // .pipe
      // takeUntil(this.destroy$),
      // tap(console.log),
      // tap(
      //   (campaign: Campaign) => {
      //     debugger;
      //     this.campaignUx = campaign.toFormValues();
      //   },
      //   (err) => {
      //     console.error(err);
      //     this._router.navigate(['/campaign']).then(() => {
      //       this._toastr.error("Les données de la campagne n'ont pas pu être chargées");
      //     });
      //   },
      // ),
      // mergeMap((campaign) => this._territoryApi.find({ _id: campaign.territory_id })),
      // tap((territory) => (this.territory = territory)),
      // ()
      .pipe(
        switchMap((campaign: Campaign) => {
          this.campaignUx = new CampaignUx(campaign.toFormValues());
          return of(campaign.territory_id);
        }),
        tap(console.log),
        switchMap((_id) => this._territoryApi.find({ _id })),
        takeUntil(this.destroy$),
      )
      .subscribe((territory) => {
        this.territory = territory;
        this.isLoaded = true;
      });
  }
}
