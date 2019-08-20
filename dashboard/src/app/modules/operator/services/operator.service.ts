import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Operator } from '~/core/entities/operator/operator';
import { ApiService } from '~/core/services/api/api.service';
import { JsonRPCService } from '~/core/services/api/json-rpc.service';

@Injectable({
  providedIn: 'root',
})
export class OperatorService extends ApiService<Operator> {
  constructor(private _http: HttpClient, private _jsonRPC: JsonRPCService) {
    super(_http, _jsonRPC, 'operator');
  }
}
