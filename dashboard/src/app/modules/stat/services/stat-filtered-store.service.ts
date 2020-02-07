// tslint:disable:no-bitwise
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as _ from 'lodash';

import { FormatedStatInterface } from '~/core/interfaces/stat/formatedStatInterface';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { FilterInterface } from '~/core/interfaces/filter/filterInterface';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { StatFormatService } from '~/modules/stat/services/stat-format.service';
import { StatInterface } from '~/core/interfaces/stat/StatInterface';
import { StatApiService } from '~/modules/stat/services/stat-api.service';
import { GetListStore } from '~/core/services/store/getlist-store';

@Injectable({
  providedIn: 'root',
})
export class StatFilteredStoreService extends GetListStore<StatInterface> {
  private _formatedStat$ = new BehaviorSubject<FormatedStatInterface>(null);

  constructor(
    statApi: StatApiService,
    private _authService: AuthenticationService,
    private _statFormatService: StatFormatService,
  ) {
    super(statApi);
    this.entitiesSubject.subscribe((data) => {
      this._formatedStat$.next(this._statFormatService.formatData(data));
    });
  }

  public load(filter: FilterInterface | {} = {}): void {
    const params = _.cloneDeep(filter);

    const user = this._authService.user;

    if (user && user.group === UserGroupEnum.TERRITORY) {
      params['territory_id'] = [user.territory_id];
    }
    if (user && user.group === UserGroupEnum.OPERATOR) {
      params['operator_id'] = [user.operator_id];
    }

    if ('date' in filter && filter.date.start) {
      params.date.start = filter.date.start.toISOString();
    }
    if ('date' in filter && filter.date.end) {
      params.date.end = filter.date.end.toISOString();
    }
    this._filterSubject.next(params);
    super.loadList();
  }

  get stat(): FormatedStatInterface {
    return this._formatedStat$.value;
  }

  get stat$(): Observable<FormatedStatInterface> {
    return this._formatedStat$;
  }

  init() {
    this._formatedStat$.next(null);
  }
}
