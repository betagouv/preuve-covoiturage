import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { finalize, map, takeUntil } from 'rxjs/operators';

import { Campaign } from '~/core/entities/campaign/api-format/campaign';
import { CampaignUx } from '~/core/entities/campaign/ux-format/campaign-ux';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { CrudStore } from '~/core/services/store/crud-store';
import { CampaignApiService } from '~/modules/campaign/services/campaign-api.service';

@Injectable({
  providedIn: 'root',
})
export class CampaignStoreService extends CrudStore<Campaign, Campaign, {}, CampaignApiService, CampaignUx> {
  protected templatesSubject = new BehaviorSubject<Campaign[]>([]);
  protected dismissTempatesListSubject = new Subject();

  protected _templates$ = this.templatesSubject.asObservable();

  constructor(protected campaignApi: CampaignApiService, private _authService: AuthenticationService) {
    super(campaignApi, Campaign);
  }

  /**
   * all campaign in UX format except for templates
   */
  get campaignsUx$(): Observable<CampaignUx[]> {
    return this.entities$.pipe(map((campaigns) => campaigns.map((campaign) => new Campaign(campaign).toFormValues())));
  }

  get templates$(): Observable<Campaign[]> {
    return this._templates$;
  }

  get campaignUx(): CampaignUx {
    return this.entitySubject.value.toFormValues();
  }

  get loaded(): boolean {
    return this.entitiesSubject.value.length > 0;
  }

  loadCampaigns(): void {
    this._loadCount += 1;
    this.campaignApi
      .loadTemplates()
      .pipe(
        finalize(() => (this._loadCount -= 1)),
        takeUntil(this.dismissTempatesListSubject),
      )
      .subscribe((campaigns) => this.templatesSubject.next(campaigns));
  }

  dismissAllRpcActions(): void {
    super.dismissAllRpcActions();
    this.dismissTempatesListSubject.next();
  }

  reset(): void {
    super.reset();
    this.templatesSubject.next([]);
  }
}
