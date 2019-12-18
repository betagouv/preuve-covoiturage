// tslint:disable:no-bitwise
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import * as _ from 'lodash';

import { FormatedStatInterface } from '~/core/interfaces/stat/formatedStatInterface';
import { StatFormatService } from '~/modules/stat/services/stat-format.service';
import { StatInterface } from '~/core/interfaces/stat/StatInterface';

@Injectable({
  providedIn: 'root',
})
export class StatPublicService {
  private _formatedStat$ = new BehaviorSubject<FormatedStatInterface>(null);
  private _loaded$ = new BehaviorSubject<boolean>(false);
  private _loading$ = new BehaviorSubject<boolean>(false);

  constructor(private _http: HttpClient, private _statFormatService: StatFormatService) {}

  public loadOne(): Observable<StatInterface[]> {
    this._loading$.next(true);
    return this._http.get('stats').pipe(
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
