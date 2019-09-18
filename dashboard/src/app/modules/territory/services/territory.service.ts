import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { JsonRPCService } from '~/core/services/api/json-rpc.service';
import { ApiService } from '~/core/services/api/api.service';
import { Territory } from '~/core/entities/territory/territory';

@Injectable({
  providedIn: 'root',
})
export class TerritoryService extends ApiService<Territory> {
  constructor(private _http: HttpClient, private _jsonRPC: JsonRPCService) {
    super(_http, _jsonRPC, 'territory');
  }

  get territoriesLoaded(): boolean {
    return this._loaded$.value;
  }

  get territory$(): Observable<Territory> {
    return this._entity$;
  }

  get territory(): Territory {
    return this._entity$.value;
  }
}
