import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import { ParamsInterface } from '~/core/entities/api/shared/operator/patchContacts.contract';
import { Operator } from '~/core/entities/operator/operator';
import { JsonRpcCrud } from '~/core/services/api/json-rpc.crud';

@Injectable({
  providedIn: 'root',
})
export class OperatorApiService extends JsonRpcCrud<Operator> {
  constructor(http: HttpClient) {
    super(http, 'operator');
  }

  patchContact(item: ParamsInterface): Observable<Operator> {
    const jsonRPCParam = new JsonRPCParam(`${this.method}:patchContacts`, item);

    return this.callOne(jsonRPCParam).pipe(map((data) => data.data));
  }

  patchThumbnail(item: { _id: number; thumbnail: string }): Observable<Operator> {
    const jsonRPCParam = new JsonRPCParam(`${this.method}:patchThumbnail`, item);

    return this.callOne(jsonRPCParam).pipe(map((data) => data.data));
  }
}
