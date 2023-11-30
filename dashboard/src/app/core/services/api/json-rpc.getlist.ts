import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import { JsonRPC } from '~/core/services/api/json-rpc.service';

export enum GetListActions {
  FIND = 'find',
  LIST = 'list',
}

export class JsonRpcGetList<EntityT, ListEntityT = EntityT, IGetT = any, IGetListT = any> extends JsonRPC {
  constructor(
    http: HttpClient,
    protected method: string,
  ) {
    super(http);
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
