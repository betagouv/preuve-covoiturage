// tslint:disable:no-bitwise
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, take, tap } from 'rxjs/operators';
import * as _ from 'lodash';

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
export class StatPublicService {
  private _formatedStat$ = new BehaviorSubject<FormatedStatInterface>(null);
  private _loaded$ = new BehaviorSubject<boolean>(false);
  private _loading$ = new BehaviorSubject<boolean>(false);

  constructor(
    private _http: HttpClient,
    private _jsonRPC: JsonRPCService,
    private _statFormatService: StatFormatService,
    private _authService: AuthenticationService,
  ) {}

  public loadOne(): Observable<StatInterface[]> {
    const user = this._authService.user;
    this._loading$.next(true);
    const jsonRPCParam = new JsonRPCParam(`trip:publicStats`);
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
}
