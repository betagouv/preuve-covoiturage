import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApiService } from '~/core/services/api/api.service';
import { JsonRPCService } from '~/core/services/api/json-rpc.service';
import { Campaign } from '~/core/entities/campaign/campaign';
import { BehaviorSubject, Observable } from 'rxjs';
import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import { finalize, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CampaignService extends ApiService<Campaign> {
  _templates$ = new BehaviorSubject<Campaign[]>([]);

  constructor(private _http: HttpClient, private _jsonRPC: JsonRPCService) {
    super(_http, _jsonRPC, 'trip');
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
}
