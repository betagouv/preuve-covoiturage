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
  constructor(private _http: HttpClient, private _jsonRPC: JsonRPCService) {
    super(_http, _jsonRPC, 'territory');
  }

  get territory$(): Observable<Territory> {
    return this._entity$;
  }

  get territory(): Territory {
    return this._entity$.value;
  }
}
