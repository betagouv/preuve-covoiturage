import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { bufferTime, concatMap, map, take, takeUntil } from 'rxjs/operators';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { Campaign } from '~/core/entities/campaign/api-format/campaign';
import { CampaignUx } from '~/core/entities/campaign/ux-format/campaign-ux';
import { Roles } from '~/core/enums/user/roles';
import { catchHttpError } from '~/core/operators/catchHttpStatus';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { CampaignStoreService } from '~/modules/campaign/services/campaign-store.service';
import { TerritoryApiService } from '~/modules/territory/services/territory-api.service';
import { TerritoryGroupInterface } from '~/shared/territory/common/interfaces/TerritoryInterface';

@Component({
  selector: 'app-campaign-view',
  templateUrl: './campaign-view.component.html',
  styleUrls: ['./campaign-view.component.scss'],
})
export class CampaignViewComponent extends DestroyObservable implements OnInit {
  public territory: TerritoryGroupInterface;
  public campaignUx: CampaignUx;
  public showSummary = false;
  public isLoaded = false;
  public userIsTerritory: boolean;
  public userIsDemo: boolean;

  get isDraft(): boolean {
    return this.campaignUx?.status === 'draft';
  }

  get hasExpired(): boolean {
    return this.campaignUx?.end.toDate().getTime() < new Date().getTime();
  }

  get isLaunchable(): boolean {
    return this.isDraft && this.userIsTerritory && !this.userIsDemo;
  }

  constructor(
    public auth: AuthenticationService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _toastr: ToastrService,
    private _territoryApi: TerritoryApiService,
    private _campaignStoreService: CampaignStoreService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.userIsTerritory = this.auth.isTerritory();
    this.userIsDemo = this.auth.hasRole(Roles.TerritoryDemo);

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
        catchHttpError(404, () => {
          this._toastr.error('Campagne non trouvée');
          this._router.navigateByUrl('/campaign');
        }),
        // set the local var with a mapped version of the data
        // and pass its territory_id on
        concatMap((campaign: Campaign) => {
          this.campaignUx = new CampaignUx(campaign.toFormValues());
          return of(campaign.territory_id);
        }),
        // fetch the territory data
        concatMap((_id) => this._territoryApi.getById(_id)),
        takeUntil(this.destroy$),
      )
      .subscribe((territory: TerritoryGroupInterface) => {
        this.territory = territory;
        this.isLoaded = true;
      });
  }
}
