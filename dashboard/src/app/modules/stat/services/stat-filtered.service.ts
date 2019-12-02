// tslint:disable:no-bitwise
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, take, tap } from 'rxjs/operators';
import * as _ from 'lodash';
import * as moment from 'moment';

import { JsonRPCService } from '~/core/services/api/json-rpc.service';
import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import { FormatedStatInterface } from '~/core/interfaces/stat/formatedStatInterface';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { FilterInterface } from '~/core/interfaces/filter/filterInterface';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { StatFormatService } from '~/modules/stat/services/stat-format.service';
import { StatInterface } from '~/core/interfaces/stat/StatInterface';

@Injectable({
  providedIn: 'root',
})
export class StatFilteredService {
  private _formatedStat$ = new BehaviorSubject<FormatedStatInterface>(null);
  private _loaded$ = new BehaviorSubject<boolean>(false);
  private _loading$ = new BehaviorSubject<boolean>(false);

  constructor(
    private _http: HttpClient,
    private _jsonRPC: JsonRPCService,
    private _statFormatService: StatFormatService,
    private _authService: AuthenticationService,
  ) {}

  public loadOne(filter: FilterInterface = {}): Observable<StatInterface[]> {
    let params: FilterInterface = {};

    if (Object.values(filter).length === 0) {
      params = {
        date: {
          start: moment()
            .subtract(1, 'year')
            .toDate(),
          end: new Date(),
        },
      };
    } else {
      params = _.cloneDeep(filter);
    }

    const user = this._authService.user;

    if (user && user.group === UserGroupEnum.TERRITORY) {
      params['territory_id'] = [user.territory_id];
    }
    if (user && user.group === UserGroupEnum.OPERATOR) {
      params['operator_id'] = [user.operator_id];
    }
    this._loading$.next(true);
    const jsonRPCParam = new JsonRPCParam(`trip:stats`, params);
    return this._jsonRPC.callOne(jsonRPCParam).pipe(
      map((data) => data.data),
      tap((data: StatInterface[]) => {
        const formatedStat = this._statFormatService.formatData(data);
        this._formatedStat$.next(formatedStat);
        this._loaded$.next(true);
        this._loading$.next(false);
      }),
    );
  }

  get loading(): boolean {
    return this._loading$.value;
  }

  get loaded(): boolean {
    return this._loaded$.value;
  }

  get stat(): FormatedStatInterface {
    return this._formatedStat$.value;
  }

  get stat$(): Observable<FormatedStatInterface> {
    return this._formatedStat$;
  }

  init() {
    this._formatedStat$.next(null);
    this._loaded$.next(false);
  }
}
