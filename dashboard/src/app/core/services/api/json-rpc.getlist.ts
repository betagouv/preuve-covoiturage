import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { JsonRPC } from '~/core/services/api/json-rpc.service';
import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';

export enum GetListActions {
  FIND = 'find',
  LIST = 'list',
}

export class JsonRpcGetList<EntityT, ListEntityT = EntityT, IGetT = any, IGetListT = any> extends JsonRPC {
  constructor(http: HttpClient, router: Router, activatedRoute: ActivatedRoute, protected method: string) {
    super(http, router, activatedRoute);
  }

  protected defaultListParam: any = {};

  paramGetList(params?: IGetListT): JsonRPCParam<any> {
    return new JsonRPCParam(`${this.method}:${GetListActions.LIST}`, { ...this.defaultListParam, ...params });
  }

  paramGet(params: IGetT): JsonRPCParam<any> {
    return new JsonRPCParam(`${this.method}:${GetListActions.FIND}`, params);
  }

  paramGetById(id: number): JsonRPCParam<any> {
    return this.paramGet({ _id: id } as any);
  }

  get(params: IGetT): Observable<EntityT> {
    return this.callOne(this.paramGet(params)).pipe(map((data) => data.data));
  }

  getList(params?: IGetListT): Observable<{ data: ListEntityT[]; meta: any }> {
    return this.callOne(this.paramGetList(params));
  }

  getById(id: number): Observable<EntityT> {
    return this.get({ _id: id } as any);
  }
}
