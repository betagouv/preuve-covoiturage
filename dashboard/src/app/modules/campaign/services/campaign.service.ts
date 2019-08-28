import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { finalize, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

import { ApiService } from '~/core/services/api/api.service';
import { JsonRPCService } from '~/core/services/api/json-rpc.service';
import { Campaign } from '~/core/entities/campaign/campaign';
import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import { IncentiveFormulaParameter } from '~/core/entities/campaign/incentive-formula-parameter';

@Injectable({
  providedIn: 'root',
})
export class CampaignService extends ApiService<Campaign> {
  _templates$ = new BehaviorSubject<Campaign[]>([]);
  _parameters$ = new BehaviorSubject<IncentiveFormulaParameter[]>([]);
  _paramatersLoaded$ = new BehaviorSubject<boolean>(false);

  constructor(private _http: HttpClient, private _jsonRPC: JsonRPCService) {
    super(_http, _jsonRPC, 'campaign');
  }

  public loadTemplates(): Observable<Campaign[]> {
    this._loading$.next(true);
    const jsonRPCParam = new JsonRPCParam(`${this._method}.listTemplates`);
    return this._jsonRPC.call(jsonRPCParam).pipe(
      tap((data) => {
        this._templates$.next(data);
      }),
      finalize(() => {
        this._loading$.next(false);
      }),
    );
  }

  public loadFormulaParameters(): Observable<IncentiveFormulaParameter[]> {
    this._loading$.next(true);
    const jsonRPCParam = new JsonRPCParam(`${this._method}.listFormulaParameters`);
    return this._jsonRPC.call(jsonRPCParam).pipe(
      tap((data) => {
        this._parameters$.next(data);
        this._paramatersLoaded$.next(true);
      }),
      finalize(() => {
        this._loading$.next(false);
      }),
    );
  }
}
