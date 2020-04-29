import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import { JsonRpcCrud } from '~/core/services/api/json-rpc.crud';
import { Territory } from '~/core/entities/territory/territory';
import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import { ParamsInterface } from '~/core/entities/api/shared/territory/patchContacts.contract';
import { catchHttpStatus } from '~/core/operators/catchHttpStatus';

import {
  ParamsInterface as OTVisibityParams,
  ResultInterface as OTVisibityResults,
} from '../../../../../../shared/territory/listOperator.contract';
import {
  ParamsInterface as FindParamsInterface,
  QueryParamsInterface,
} from '../../../../../../shared/territory/find.contract';
import {
  SortEnum,
  allBasicFieldEnum,
} from '../../../../../../shared/territory/common/interfaces/TerritoryQueryInterface';
import {
  TerritoryChildrenInterface,
  TerritoryParentChildrenInterface,
} from '../../../../../../shared/territory/common/interfaces/TerritoryChildrenInterface';

@Injectable({
  providedIn: 'root',
})
export class TerritoryApiService extends JsonRpcCrud<Territory> {
  constructor(http: HttpClient, router: Router, activatedRoute: ActivatedRoute, protected _toastr: ToastrService) {
    super(http, router, activatedRoute, 'territory');
  }

  patchContact(item: ParamsInterface): Observable<Territory> {
    const jsonRPCParam = new JsonRPCParam(`${this.method}:patchContacts`, item);

    return this.callOne(jsonRPCParam).pipe(map((data) => data.data));
  }

  protected catchSiretConflict<T>(obs$: Observable<T>): Observable<T> {
    return obs$.pipe(
      catchHttpStatus(409, (err) => {
        this._toastr.error('Ce numéro SIRET est déjà utilisé par un autre territoire.');
        throw err;
      }),
    );
  }

  getDirectRelation(id: number): Observable<TerritoryParentChildrenInterface> {
    const jsonRPCParam = new JsonRPCParam(`${this.method}:getParentChildren`, { _id: id });
    return this.callOne(jsonRPCParam).pipe(map((data) => data.data)) as Observable<TerritoryParentChildrenInterface>;
  }

  getIntermediaryRelation(id: number): Observable<TerritoryChildrenInterface[]> {
    const jsonRPCParam = new JsonRPCParam(`${this.method}:getIntermediaryRelation`, { _id: id });
    return this.callOne(jsonRPCParam).pipe(map((data) => data.data)) as Observable<TerritoryChildrenInterface[]>;
  }

  find(
    query: QueryParamsInterface,
    sort: SortEnum[] = [SortEnum.NameAsc],
    projection: any = allBasicFieldEnum,
  ): Observable<Territory> {
    const params: FindParamsInterface = {
      query,
      sort,
      projection,
    };
    const jsonRPCParam = new JsonRPCParam(`${this.method}:find`, params);
    return this.callOne(jsonRPCParam).pipe(map((data) => data.data));
  }

  create(item: Territory): Observable<Territory> {
    return this.catchSiretConflict(super.create(item));
  }

  update(item: Territory): Observable<Territory> {
    return this.catchSiretConflict(super.update(item));
  }

  getOperatorVisibility(territoryId: number): Observable<OTVisibityResults> {
    const jsonRPCParam = new JsonRPCParam<OTVisibityParams>(`${this.method}:listOperator`, {
      territory_id: territoryId,
    });

    return this.callOne(jsonRPCParam).pipe(map((data) => data.data as OTVisibityResults));
  }
}
