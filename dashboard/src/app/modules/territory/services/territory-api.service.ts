import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ParamsInterface as FindByIdParamsInterface, signature as signatureFind } from 'shared/territory/find.contract';
import {
  ParamsInterface as ParamsInterfaceFindByCode,
  ResultInterface as ResultInterfaceFindByCode,
  signature as signatureFindByCode,
} from 'shared/territory/findGeoByCode.contract';
import { ParamsInterface as TerritoryListFilter, signature as signatureList } from 'shared/territory/list.contract';
import { ParamsInterface as ParamsInterfaceGeo, signature as signatureGeo } from 'shared/territory/listGeo.contract';
import {
  ParamsInterface as PatchContactParamsInterface,
  signature as signaturePatch,
} from 'shared/territory/patchContacts.contract';
import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import { JsonRPCResult } from '~/core/entities/api/jsonRPCResult';
import { Territory } from '~/core/entities/territory/territory';
import { catchHttpStatus } from '~/core/operators/catchHttpStatus';
import { CrudActions, JsonRpcCrud } from '~/core/services/api/json-rpc.crud';
import { TerritoryBaseInterface } from '../../../../../../shared/territory/common/interfaces/TerritoryInterface';

@Injectable({
  providedIn: 'root',
})
export class TerritoryApiService extends JsonRpcCrud<Territory, Territory, any, any, any, TerritoryListFilter> {
  constructor(http: HttpClient, router: Router, activatedRoute: ActivatedRoute, protected _toastr: ToastrService) {
    super(http, router, activatedRoute, 'territory');
  }

  patchContact(item: PatchContactParamsInterface): Observable<Territory> {
    const jsonRPCParam = new JsonRPCParam(signaturePatch, item);
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
    return new JsonRPCParam(signatureList, { ...this.defaultListParam, ...params });
  }

  findByInsees(insees: string[]): Observable<ResultInterfaceFindByCode> {
    const params: ParamsInterfaceFindByCode = { insees };
    const jsonRPCParam = new JsonRPCParam(signatureFindByCode, params);
    return this.callOne(jsonRPCParam).pipe(map((data) => data.data));
  }

  paramGetById(id: number): JsonRPCParam<any> {
    return new JsonRPCParam(signatureFind, { _id: id });
  }

  geo(params: ParamsInterfaceGeo): Observable<JsonRPCResult> {
    const jsonRPCParam: JsonRPCParam = new JsonRPCParam(signatureGeo, params);
    return this.callOne(jsonRPCParam);
  }

  get(query: FindByIdParamsInterface): Observable<Territory> {
    const jsonRPCParam = this.paramGetById(query._id);
    return this.callOne(jsonRPCParam).pipe(map((data) => data.data));
  }

  createNew(item: TerritoryBaseInterface): Observable<TerritoryBaseInterface> {
    const jsonRPCParam = new JsonRPCParam(`${this.method}:${CrudActions.CREATE}`, item);
    return this.callOne(jsonRPCParam).pipe(map((data) => data.data));
  }

  update(item: Territory): Observable<Territory> {
    return this.catchSiretConflict(super.update(item));
  }
}
