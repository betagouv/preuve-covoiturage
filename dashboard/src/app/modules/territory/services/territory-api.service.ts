import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import { JsonRPCResult } from '~/core/entities/api/jsonRPCResult';
// eslint-disable-next-line max-len
import { ParamsInterface as PatchContactParamsInterface } from '~/core/entities/api/shared/territory/patchContacts.contract';
import { Territory, TerritoryInsee } from '~/core/entities/territory/territory';
import { catchHttpStatus } from '~/core/operators/catchHttpStatus';
import { JsonRpcCrud } from '~/core/services/api/json-rpc.crud';
import { GetListActions } from '~/core/services/api/json-rpc.getlist';
import { ParamsInterface as FindByIdParamsInterface } from '../../../../../../shared/territory/find.contract';
import { ParamsInterface as TerritoryListFilter } from '../../../../../../shared/territory/list.contract';
import {
  signature as signatureGeo,
  ParamsInterface as ParamsInterfaceGeo,
} from '../../../../../../shared/territory/listGeo.contract';

@Injectable({
  providedIn: 'root',
})
export class TerritoryApiService extends JsonRpcCrud<Territory, Territory, any, any, any, TerritoryListFilter> {
  constructor(http: HttpClient, router: Router, activatedRoute: ActivatedRoute, protected _toastr: ToastrService) {
    super(http, router, activatedRoute, 'territory');
  }

  patchContact(item: PatchContactParamsInterface): Observable<Territory> {
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

  paramGetList(params?: TerritoryListFilter): JsonRPCParam<any> {
    return new JsonRPCParam(`${this.method}:${GetListActions.LIST}`, { ...this.defaultListParam, ...params });
  }

  findByInsees(insees: string[]): Observable<TerritoryInsee[]> {
    const jsonRPCParam = new JsonRPCParam(`${this.method}:findByInsees`, { insees });

    return this.callOne(jsonRPCParam).pipe(map((data) => data.data)) as Observable<TerritoryInsee[]>;
  }

  paramGetById(id: number): JsonRPCParam<any> {
    return this.paramGet({ _id: id } as any);
  }

  paramGet(params: any): JsonRPCParam<any> {
    return new JsonRPCParam(`${this.method}:${GetListActions.FIND}`, { query: { ...params } });
  }

  dropdown(params: { search?: string; parent_id?: number }): Observable<JsonRPCResult> {
    return this.callOne(new JsonRPCParam(`${this.method}:dropdown`, params));
  }

  geo(params: ParamsInterfaceGeo): Observable<JsonRPCResult> {
    const jsonRPCParam: JsonRPCParam = new JsonRPCParam(signatureGeo, params);
    return this.callOne(jsonRPCParam);
  }

  get(query: FindByIdParamsInterface): Observable<Territory> {
    const jsonRPCParam = this.paramGet(query);
    return this.callOne(jsonRPCParam).pipe(map((data) => data.data));
  }

  create(item: Territory): Observable<Territory> {
    return this.catchSiretConflict(super.create(item));
  }

  update(item: Territory): Observable<Territory> {
    return this.catchSiretConflict(super.update(item));
  }
}
