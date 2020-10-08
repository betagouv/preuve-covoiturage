import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

import { FormatedStatInterface } from '~/core/interfaces/stat/formatedStatInterface';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { StatInterface } from '~/core/interfaces/stat/StatInterface';
import { GetListStore } from '~/core/services/store/getlist-store';
import { StatApiService } from '~/modules/stat/services/stat-api.service';
import { StatFormatService } from '~/modules/stat/services/stat-format.service';
import { TripSearchInterface } from '~/core/entities/api/shared/trip/common/interfaces/TripSearchInterface';
import { JsonRpcGetList } from '~/core/services/api/json-rpc.getlist';

@Injectable({
  providedIn: 'root',
})
export class StatStoreService extends GetListStore<StatInterface> {
  private _formatedStat$ = new BehaviorSubject<FormatedStatInterface>(null);

  constructor(
    protected statApi: StatApiService,
    private _authService: AuthenticationService,
    private _statFormatService: StatFormatService,
  ) {
    super(statApi as JsonRpcGetList<StatInterface, StatInterface, any, TripSearchInterface>);
    this.entitiesSubject.pipe(filter((val) => val.length > 0)).subscribe((data) => {
      this._formatedStat$.next(this._statFormatService.formatData(data));
    });
  }

  public load(): void {
    const params = {};
    this._filterSubject.next(params);
  }

  get stat(): FormatedStatInterface {
    return this._formatedStat$.value;
  }

  get stat$(): Observable<FormatedStatInterface> {
    return this._formatedStat$;
  }

  init(): void {
    this._formatedStat$.next(null);
  }
}
