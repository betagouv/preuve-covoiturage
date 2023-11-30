import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import { Model } from '~/core/entities/IModel';
import { JsonRpcGetList } from '~/core/services/api/json-rpc.getlist';
import { PatchParams } from '~/core/services/store/crud-store';

export interface DeleteResponse {
  _id: number;
  success: boolean;
}

export enum CrudActions {
  CREATE = 'create',
  UPDATE = 'update',
  PATCH = 'patch',
  DELETE = 'delete',
}

export class JsonRpcCrud<
  EntityT extends Model,
  ListEntityT extends Model = EntityT,
  IPatchT = any,
  IDeleteT = any, // eslint-disable-line @typescript-eslint/no-unused-vars
  IGetT = any,
  IGetListT = any,
  ICreateT = EntityT, // eslint-disable-line @typescript-eslint/no-unused-vars
  IUpdateT = EntityT, // eslint-disable-line @typescript-eslint/no-unused-vars
> extends JsonRpcGetList<EntityT, ListEntityT, IGetT, IGetListT> {
  constructor(
    http: HttpClient,
    protected method: string,
  ) {
    super(http, method);
  }

  create(item: EntityT): Observable<EntityT> {
    const jsonRPCParam = new JsonRPCParam(`${this.method}:${CrudActions.CREATE}`, item);
    return this.callOne(jsonRPCParam).pipe(map((data) => data.data));
  }

  update(item: EntityT): Observable<EntityT> {
    const jsonRPCParam = new JsonRPCParam(`${this.method}:${CrudActions.UPDATE}`, item);
    return this.callOne(jsonRPCParam).pipe(map((data) => data.data));
  }

  patch(id: number, patch: IPatchT): Observable<EntityT> {
    const patchParams: PatchParams<IPatchT> = {
      patch,
      _id: id,
    };

    const jsonRPCParam = new JsonRPCParam(`${this.method}:${CrudActions.PATCH}`, patchParams);
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
