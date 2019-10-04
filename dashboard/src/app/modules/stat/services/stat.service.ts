// tslint:disable:no-bitwise
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';

import { JsonRPCService } from '~/core/services/api/json-rpc.service';
import { Stat } from '~/core/entities/stat/stat';
import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import { Axes, FormatedStatInterface } from '~/core/interfaces/stat/formatedStatInterface';
import { ApiService } from '~/core/services/api/api.service';
import { StatInterface } from '~/core/interfaces/stat/statInterface';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { FilterInterface } from '~/core/interfaces/filter/filterInterface';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { StatFormatService } from '~/modules/stat/services/stat-format.service';

@Injectable({
  providedIn: 'root',
})
export class StatService extends ApiService<StatInterface> {
  public _formatedStat$ = new BehaviorSubject<FormatedStatInterface>(null);
  public _loaded$ = new BehaviorSubject<boolean>(false);
  protected _loading$ = new BehaviorSubject<boolean>(false);

  constructor(
    private _http: HttpClient,
    private _jsonRPC: JsonRPCService,
    private _statFormatService: StatFormatService,
    private _authService: AuthenticationService,
  ) {
    super(_http, _jsonRPC, 'stat');
  }

  public loadOne(filter: FilterInterface | {} = {}): Observable<Stat> {
    const user = this._authService.user;
    if (user && user.group === UserGroupEnum.TERRITORY) {
      filter['territory_id'] = [user.territory];
      // TODO: temp, remove when filter operator added
      if ('operator_id' in filter) {
        delete filter.operator_id;
      }
    }
    if (user && user.group === UserGroupEnum.OPERATOR) {
      filter['operator_id'] = [user.operator];
    }
    this._loading$.next(true);
    const jsonRPCParam = new JsonRPCParam(`trip:stats`, filter);
    return this._jsonRPC.callOne(jsonRPCParam).pipe(
      map((data) => data.data),
      tap((data) => {
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

  get stat(): FormatedStatInterface {
    return this._formatedStat$.value;
  }

  get stat$(): Observable<FormatedStatInterface> {
    return this._formatedStat$;
  }
}
