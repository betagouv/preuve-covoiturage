import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JsonRPCError } from '~/core/entities/api/jsonRPCError';
import { JsonRPCOptions } from '~/core/entities/api/jsonRPCOptions';
import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import { JsonRPCResponse } from '~/core/entities/api/jsonRPCResponse';
import { JsonRPCResult } from '~/core/entities/api/jsonRPCResult';
import { CrudActions } from '~/core/services/api/json-rpc.crud';
import {
  CreateTerritoryGroupInterface,
  TerritoryInterface,
  UpdateTerritoryGroupInterface,
} from '~/shared/territory/common/interfaces/TerritoryInterface';
import { signature as signatureFind } from '~/shared/territory/find.contract';
import {
  ParamsInterface as ParamsInterfaceFindGeoBySiren,
  signature as signatureFindGeoBySiren,
  SingleResultInterface as FindGeoBySirenResultInterface,
} from '~/shared/territory/findGeoBySiren.contract';
import { ParamsInterface as TerritoryListFilter, signature as signatureList } from '~/shared/territory/list.contract';
import {
  ParamsInterface as ParamsInterfaceGeo,
  signature as signatureGeo,
  SingleResultInterface as TerritoryGeoResultInterface,
} from '~/shared/territory/listGeo.contract';
import {
  ParamsInterface as PatchContactParamsInterface,
  signature as signaturePatch,
} from '~/shared/territory/patchContacts.contract';
import { ResultWithPagination } from '../../../../../../shared/common/interfaces/ResultWithPagination';

@Injectable({
  providedIn: 'root',
})
export class TerritoryApiService {
  private readonly METHOD: string = 'territory';
  private readonly DEFAULT_LIST_PARAMS: any = {};
  private readonly URL = 'rpc';

  constructor(private http: HttpClient) {}

  patchContact(item: PatchContactParamsInterface): Observable<TerritoryInterface> {
    const jsonRPCParam = new JsonRPCParam(signaturePatch, item);
    return this.callOne(jsonRPCParam).pipe(map((data) => data.data));
  }

  paramGetList(params?: TerritoryListFilter): JsonRPCParam<any> {
    return new JsonRPCParam(signatureList, { ...this.DEFAULT_LIST_PARAMS, ...params });
  }

  paramGetById(id: number): JsonRPCParam<any> {
    return new JsonRPCParam(signatureFind, { _id: id });
  }

  geo(params: ParamsInterfaceGeo): Observable<ResultWithPagination<TerritoryGeoResultInterface>> {
    const jsonRPCParam: JsonRPCParam = new JsonRPCParam(signatureGeo, params);
    return this.callOne(jsonRPCParam);
  }

  findGeoBySiren(params: ParamsInterfaceFindGeoBySiren): Observable<FindGeoBySirenResultInterface> {
    const jsonRPCParam: JsonRPCParam = new JsonRPCParam(signatureFindGeoBySiren, params);
    return this.callOne(jsonRPCParam).pipe(map((result) => result.data));
  }

  createNew(item: CreateTerritoryGroupInterface): Observable<TerritoryInterface> {
    const jsonRPCParam = new JsonRPCParam(`${this.METHOD}:${CrudActions.CREATE}`, item);
    return this.callOne(jsonRPCParam).pipe(map((result) => result.data));
  }

  updateNew(item: UpdateTerritoryGroupInterface): Observable<TerritoryInterface> {
    const jsonRPCParam = new JsonRPCParam(`${this.METHOD}:${CrudActions.UPDATE}`, item);
    return this.callOne(jsonRPCParam).pipe(map((data) => data.data));
  }

  getById(id: number): Observable<TerritoryInterface> {
    const jsonRPCParam = this.paramGetById(id);
    return this.callOne(jsonRPCParam).pipe(map((data) => data.data));
  }

  getList(params?: any): Observable<{ data: TerritoryInterface[]; meta: any }> {
    return this.callOne(this.paramGetList(params));
  }

  private callOne(method: JsonRPCParam, options?: JsonRPCOptions, throwErrors = true): Observable<JsonRPCResult> {
    return this.call([method], options, throwErrors).pipe(map((datas) => datas[0]));
  }

  private call(methods: JsonRPCParam[], options?: JsonRPCOptions, throwErrors = true): Observable<JsonRPCResult[]> {
    // handle default withCredentials = true for empty object and undefined property
    const finalOptions = options ? options : { withCredentials: true };
    finalOptions.withCredentials = finalOptions.withCredentials !== undefined ? finalOptions.withCredentials : true;

    let urlWithMethods = this.URL;
    methods.forEach((method, index) => {
      // increment param id in order to avoid collisions
      method.id += index;
      if (index === 0) {
        urlWithMethods += '?methods=';
      } else {
        urlWithMethods += ',';
      }
      urlWithMethods += `${method.method}`;
    });

    return this.http.post(urlWithMethods, methods, finalOptions).pipe(
      map((response: JsonRPCResponse[]) => {
        const res: { id: number; data: any; meta: any }[] = [];
        response.forEach((data: JsonRPCResponse) => {
          if (data.error) {
            const error = new JsonRPCError(data.error);
            console.error(`[${error.message}]`, data.error?.data);
            if (throwErrors) throw error;
          }

          // temporary compatibility solver (for result | result.data)
          const resultData = data.result ? (data.result.data !== undefined ? data.result.data : data.result) : null;
          const resultMeta = data.result && data.result.meta ? data.result.meta : null;

          res.push({ id: data.id, data: resultData, meta: resultMeta });
        });

        return res;
      }),
    );
  }
}
