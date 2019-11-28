import { JsonRpcCrud } from '~/core/services/api/json-rpc.crud';
import { Territory } from '~/core/entities/territory/territory';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { ParamsInterface } from '~/core/entities/api/shared/territory/patchContacts.contract';
import { TerritoryInterface } from '~/core/entities/api/shared/territory/common/interfaces/TerritoryInterface';

@Injectable({
  providedIn: 'root',
})
export class TerritoryApiService extends JsonRpcCrud<Territory> {
  constructor(http: HttpClient, router: Router, activatedRoute: ActivatedRoute) {
    super(http, router, activatedRoute, 'territory');
  }

  patchContact(item: ParamsInterface): Observable<Territory> {
    const jsonRPCParam = new JsonRPCParam(`${this.method}:patchContacts`, item);

    return this.callOne(jsonRPCParam).pipe(map((data) => data.data));
  }
}
