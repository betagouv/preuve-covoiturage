import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { bufferTime, concatMap, map, take, takeUntil } from 'rxjs/operators';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { Roles } from '~/core/enums/user/roles';
import { catchHttpError } from '~/core/operators/catchHttpStatus';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { TerritoryApiService } from '~/modules/territory/services/territory-api.service';
import { PolicyInterface } from '~/shared/policy/common/interfaces/PolicyInterface';
import { TerritoryGroupInterface } from '~/shared/territory/common/interfaces/TerritoryInterface';
import { CampaignApiService } from '../../services/campaign-api.service';

@Component({
  selector: 'app-campaign-view',
  templateUrl: './campaign-view.component.html',
  styleUrls: ['./campaign-view.component.scss'],
})
export class CampaignViewComponent extends DestroyObservable implements OnInit {
  public territory: TerritoryGroupInterface;
  public campaignUx: PolicyInterface;
  public showSummary = false;
  public isLoaded = false;
  public userIsTerritory: boolean;
  public userIsDemo: boolean;

  get hasExpired(): boolean {
    return this.campaignUx?.end_date.getTime() < new Date().getTime();
  }

  constructor(
    public auth: AuthenticationService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _toastr: ToastrService,
    private _territoryApi: TerritoryApiService,
    private _campaignStoreService: CampaignApiService,
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
        concatMap((campaign: PolicyInterface) => {
          this.campaignUx = campaign;
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
