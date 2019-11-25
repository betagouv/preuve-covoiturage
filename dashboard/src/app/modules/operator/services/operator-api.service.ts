import { JsonRpcCrud } from '~/core/services/api/json-rpc.crud';
import { Operator } from '~/core/entities/operator/operator';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { ParamsInterface } from '~/core/entities/api/shared/operator/patchContacts.contract';

@Injectable({
  providedIn: 'root',
})
export class OperatorApiService extends JsonRpcCrud<Operator> {
  constructor(http: HttpClient, router: Router, activatedRoute: ActivatedRoute) {
    super(http, router, activatedRoute, 'operator');
  }

  patchContact(item: ParamsInterface): Observable<Operator> {
    const jsonRPCParam = new JsonRPCParam(`${this.method}:patchContacts`, item);

    return this.callOne(jsonRPCParam).pipe(map((data) => data.data));
  }
}
