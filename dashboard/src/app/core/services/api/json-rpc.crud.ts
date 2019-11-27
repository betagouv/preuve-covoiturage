import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { JsonRPC, JsonRPCService } from '~/core/services/api/json-rpc.service';
import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import { IModel } from '~/core/entities/IModel';

export interface DeleteResponse {
  _id: number;
  success: boolean;
}

export enum CrudActions {
  FIND = 'find',
  LIST = 'list',
  CREATE = 'create',
  UPDATE = 'update',
  PATCH = 'patch',
  DELETE = 'delete',
}

export class JsonRpcCrud<
  EntityT extends IModel,
  ListEntityT extends IModel = EntityT,
  IPatchT = any,
  IGetT = any,
  IGetListT = any,
  ICreateT = any,
  IUpdateT = any
> extends JsonRPC {
  constructor(http: HttpClient, router: Router, activatedRoute: ActivatedRoute, protected method: string) {
    super(http, router, activatedRoute);
  }

  protected defaultListParam: any = {};

  paramGetList(params?: IGetListT) {
    return new JsonRPCParam(`${this.method}:${CrudActions.LIST}`, { ...this.defaultListParam, ...params });
  }

  paramGet(params: IGetT) {
    return new JsonRPCParam(`${this.method}:${CrudActions.FIND}`, params);
  }

  paramGetById(id: number) {
    return this.paramGet(<any>{ _id: id });
  }

  get(params: IGetT): Observable<EntityT> {
    return this.callOne(this.paramGet(params)).pipe(map((data) => data.data));
  }

  getList(params?: IGetListT): Observable<ListEntityT[]> {
    return this.callOne(this.paramGetList(params)).pipe(map((data) => data.data));
  }

  getById(id: number): Observable<EntityT> {
    return this.get(<any>{ _id: id });
  }

  create(item: EntityT): Observable<EntityT> {
    const jsonRPCParam = new JsonRPCParam(`${this.method}:${CrudActions.CREATE}`, item);
    return this.callOne(jsonRPCParam).pipe(map((data) => data.data));
  }

  update(item: EntityT): Observable<EntityT> {
    const jsonRPCParam = new JsonRPCParam(`${this.method}:${CrudActions.UPDATE}`, item);
    return this.callOne(jsonRPCParam).pipe(map((data) => data.data));
  }

  patch(params: IPatchT) {
    const jsonRPCParam = new JsonRPCParam(`${this.method}:${CrudActions.PATCH}`, params);
    return this.callOne(jsonRPCParam).pipe(map((data) => data.data));
  }

  delete(id: number): Observable<DeleteResponse> {
    const jsonRPCParam = new JsonRPCParam(`${this.method}:${CrudActions.DELETE}`, { _id: id });
    return this.callOne(jsonRPCParam).pipe(
      map((data) => ({
        success: data.data,
        _id: id,
      })),
    );
  }
}
