import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { concatMap, takeUntil } from 'rxjs/operators';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { catchHttpError } from '~/core/operators/catchHttpStatus';
import { AuthenticationService as Auth } from '~/core/services/authentication/authentication.service';
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
  public isLoaded = false;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _toastr: ToastrService,
    private _territoryApi: TerritoryApiService,
    private _campaignStoreService: CampaignApiService,
    private auth: Auth,
  ) {
    super();
  }

  ngOnInit(): void {
    this._campaignStoreService
      .getById(Number(this._route.snapshot.paramMap.get('campaignId')))
      .pipe(
        catchHttpError(404, () => {
          this._toastr.error('Campagne non trouvée');
          this._router.navigateByUrl('/campaign');
        }),
        concatMap((campaign: PolicyInterface) => {
          this.campaignUx = campaign;
          return of(campaign.territory_id);
        }),
        concatMap((_id) => this._territoryApi.getById(_id)),
        takeUntil(this.destroy$),
      )
      .subscribe((territory: TerritoryGroupInterface) => {
        this.territory = territory;
        this.isLoaded = true;
      });
  }
}
