import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from '~/core/services/api/api.service';
import { JsonRPCService } from '~/core/services/api/json-rpc.service';
import { Operator } from '~/core/entities/operator/operator';

@Injectable({
  providedIn: 'root',
})
export class OperatorService extends ApiService<Operator> {
  constructor(private _http: HttpClient, private _jsonRPC: JsonRPCService) {
    super(_http, _jsonRPC, 'operator');
  }

  get operator$(): Observable<Operator> {
    return this._entity$;
  }

  get operator(): Operator {
    return this._entity$.value;
  }

  get operators$(): Observable<Operator[]> {
    return this._entities$;
  }

  get operators(): Operator[] {
    return this._entities$.value;
  }
}
