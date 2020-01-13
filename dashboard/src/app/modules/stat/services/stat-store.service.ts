import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

import { FormatedStatInterface } from '~/core/interfaces/stat/formatedStatInterface';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { StatInterface } from '~/core/interfaces/stat/StatInterface';
import { GetListStore } from '~/core/services/store/getlist-store';
import { StatApiService } from '~/modules/stat/services/stat-api.service';
import { StatFormatService } from '~/modules/stat/services/stat-format.service';

@Injectable({
  providedIn: 'root',
})
export class StatStoreService extends GetListStore<StatInterface> {
  private _formatedStat$ = new BehaviorSubject<FormatedStatInterface>(null);

  constructor(
    statApi: StatApiService,
    private _authService: AuthenticationService,
    private _statFormatService: StatFormatService,
  ) {
    super(statApi);
    this.entitiesSubject.pipe(filter((val) => val.length > 0)).subscribe((data) => {
      this._formatedStat$.next(this._statFormatService.formatData(data));
    });
  }

  public load(): void {
    const user = this._authService.user;
    const params = {};
    if (user && user.group === UserGroupEnum.TERRITORY) {
      params['territory_id'] = [user.territory_id];
    }
    if (user && user.group === UserGroupEnum.OPERATOR) {
      params['operator_id'] = [user.operator_id];
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
