import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';

import { StatFormatService } from '~/modules/stat/services/stat-format.service';
import { JsonRPCService } from '~/core/services/api/json-rpc.service';

@Injectable({
  providedIn: 'root',
})
export class StatTmpPublicService {
  private _formatedStat$ = new BehaviorSubject<any>(null);
  private _loaded$ = new BehaviorSubject<boolean>(false);
  private _loading$ = new BehaviorSubject<boolean>(false);

  constructor(
    private _http: HttpClient,
    private _jsonRPC: JsonRPCService,
    private _statFormatService: StatFormatService,
  ) {}

  public loadOne(): Observable<any[]> {
    this._loading$.next(true);
    return this._http.get(`stats`).pipe(
      map((data: any) => data.result.data),
      tap((data: any[]) => {
        const formatedStat = this._statFormatService.formatPublicStatData(data);
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

  get stat(): any {
    return this._formatedStat$.value;
  }

  get stat$(): Observable<any> {
    return this._formatedStat$;
  }
}
