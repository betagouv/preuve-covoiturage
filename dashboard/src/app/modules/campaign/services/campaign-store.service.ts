import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize, map, takeUntil, tap } from 'rxjs/operators';

import { CrudStore } from '~/core/services/store/crud-store';
import { Campaign } from '~/core/entities/campaign/api-format/campaign';
import { CampaignApiService } from '~/modules/campaign/services/campaign-api.service';
import { CampaignUx } from '~/core/entities/campaign/ux-format/campaign-ux';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';

import { ResultInterface as LaunchResultInterface } from '~/core/entities/api/shared/policy/launch.contract';
import { ParamsInterface as PatchParamsInterface } from '~/core/entities/api/shared/policy/patch.contract';
import { ParamsInterface as DeleteParamsInterface } from '~/core/entities/api/shared/policy/delete.contract';
import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';

@Injectable({
  providedIn: 'root',
})
export class CampaignStoreService extends CrudStore<
  Campaign,
  Campaign,
  PatchParamsInterface['patch'],
  CampaignApiService,
  CampaignUx
> {
  constructor(protected campaignApi: CampaignApiService, private _authService: AuthenticationService) {
    super(campaignApi, Campaign);
  }

  /**
   * all campaign in UX format except for templates
   */
  get campaignsUx$(): Observable<CampaignUx[]> {
    return this.entities$.pipe(
      map((campaigns) =>
        campaigns
          .filter((campaign) => campaign.status !== CampaignStatusEnum.TEMPLATE)
          .map((campaign) => new Campaign(campaign).toFormValues()),
      ),
    );
  }

  get templates$(): Observable<Campaign[]> {
    return this.entities$.pipe(
      map((campaigns) => campaigns.filter((campaign) => campaign.status === CampaignStatusEnum.TEMPLATE)),
    );
  }

  get campaignUx(): CampaignUx {
    return this.entitySubject.value.toFormValues();
  }

  get loaded(): boolean {
    return this.entitiesSubject.value.length > 0;
  }

  launch(id: number): Observable<LaunchResultInterface> {
    return this.rpcCrud.launch(id).pipe(tap(this.loadList));
  }

  deleteByTerritoryId(params: DeleteParamsInterface): Observable<boolean> {
    this._loadCount += 1;
    return this.rpcCrud.deleteByTerritoryId(params).pipe(
      takeUntil(this.dismissDeleteSubject),
      finalize(() => {
        if (this._loadCount > 0) this._loadCount -= 1;
      }),
      tap((item) => {
        if (item.success) {
          this.loadList();
          this.entitySubject.next(null);
        }
      }),
      map(() => true),
    );
  }
}
