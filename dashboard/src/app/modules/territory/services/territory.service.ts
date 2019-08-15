import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';

import { JsonRPCService } from '~/core/services/api/json-rpc.service';
import { ApiService } from '~/core/services/api/api.service';
import { Territory } from '~/core/entities/territory/territory';
import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';

@Injectable({
  providedIn: 'root',
})
export class TerritoryService extends ApiService<Territory> {
  _territory$ = new BehaviorSubject<Territory>(null);

  constructor(private _http: HttpClient, private _jsonRPC: JsonRPCService) {
    super(_http, _jsonRPC, 'territory');
  }

  get territory$(): Observable<Territory> {
    return this._territory$;
  }

  get territory(): Territory {
    return this._territory$.value;
  }

  public loadTerritory(): Observable<Territory> {
    this._loading$.next(true);
    const jsonRPCParam = new JsonRPCParam(`${this._method}.read`);
    return this._jsonRPC.call(jsonRPCParam).pipe(
      tap((data) => {
        this._territory$.next(data);
        this._loaded$.next(true);
      }),
      finalize(() => {
        this._loading$.next(false);
      }),
    );
  }

  public patch(item: Territory): Observable<Territory> {
    const jsonRPCParam = new JsonRPCParam(`${this._method}.patch`, item);

    return this._jsonRPC.call(jsonRPCParam).pipe(
      tap((territory: Territory) => {
        this._territory$.next(territory);
      }),
    );
  }
}
