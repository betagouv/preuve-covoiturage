import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize, map, mergeMap, tap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { ApiService } from '~/core/services/api/api.service';
import { JsonRPCService } from '~/core/services/api/json-rpc.service';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { OperatorVisibilityInterface } from '~/core/interfaces/operator/operatorVisibilityInterface';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';

@Injectable({
  providedIn: 'root',
})
export class OperatorVisilibityService extends ApiService<OperatorVisibilityInterface> {
  constructor(
    private _http: HttpClient,
    private _jsonRPC: JsonRPCService,
    private _authService: AuthenticationService,
    private _toastr: ToastrService,
  ) {
    super(_http, _jsonRPC, 'operator');
  }

  get isLoaded() {
    return this._loaded$.value;
  }

  get operatorVisibility$(): Observable<OperatorVisibilityInterface> {
    return this._entity$;
  }

  get operatorVisibility(): OperatorVisibilityInterface {
    return this._entity$.value;
  }

  public loadOne(parameters: object = {}): Observable<OperatorVisibilityInterface> {
    this._loading$.next(true);
    const user = this._authService.user;
    const params = {};
    if (user && user.group === UserGroupEnum.OPERATOR) {
      params['operator_id'] = [user.operator];
    } else {
      this._toastr.error('Vous devez être un opérateur pour avoir accès à cette page.');
    }
    const jsonRPCParam = new JsonRPCParam(`${this._method}:visibleInTerritories`, params);
    return this._jsonRPCService.callOne(jsonRPCParam).pipe(
      map((data) => data.data),
      tap((data) => {
        this._entity$.next(data);
        this._loaded$.next(true);
      }),
      finalize(() => {
        this._loading$.next(false);
      }),
    );
  }

  public update(item: OperatorVisibilityInterface): Observable<OperatorVisibilityInterface> {
    const jsonRPCParam = new JsonRPCParam(`${this._method}:update`, item);
    return this._jsonRPCService.callOne(jsonRPCParam).pipe(
      map((data) => data.data),
      tap((entity: OperatorVisibilityInterface) => {
        this._entity$.next(entity);
      }),
    );
  }
}
