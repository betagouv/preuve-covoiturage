import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize, map, tap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { JsonRPCService } from '~/core/services/api/json-rpc.service';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { OperatorVisibilityType } from '~/core/interfaces/operator/operatorVisibilityType';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';

@Injectable({
  providedIn: 'root',
})
export class OperatorVisilibityService {
  private _entity$ = new BehaviorSubject<OperatorVisibilityType>(null);

  private _loading$ = new BehaviorSubject<boolean>(false);
  private _loaded$ = new BehaviorSubject<boolean>(false);

  private _method = 'territory';

  constructor(
    private _http: HttpClient,
    private _jsonRPCService: JsonRPCService,
    private _authService: AuthenticationService,
    private _toastr: ToastrService,
  ) {}

  get isLoaded(): boolean {
    return this._loaded$.value;
  }

  get operatorVisibility$(): Observable<OperatorVisibilityType> {
    return this._entity$;
  }

  get operatorVisibility(): OperatorVisibilityType {
    return this._entity$.value;
  }

  public loadOne(): Observable<OperatorVisibilityType> {
    this._loading$.next(true);
    const user = this._authService.user;
    const params = {};
    if (user && user.group === UserGroupEnum.OPERATOR) {
      params['operator_id'] = user.operator_id;
    } else {
      this._toastr.error('Vous devez être un opérateur pour avoir accès à cette page.');
    }
    const jsonRPCParam = new JsonRPCParam(`${this._method}:listOperator`, params);
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

  public update(territoryIds: number[]): Observable<OperatorVisibilityType> {
    const user = this._authService.user;
    const params: any = {};
    if (user && user.group === UserGroupEnum.OPERATOR) {
      params['operator_id'] = user.operator_id;
    } else {
      this._toastr.error('Vous devez être un opérateur pour avoir accès à cette page.');
    }
    params.territory_id = territoryIds;

    const jsonRPCParam = new JsonRPCParam(`${this._method}:updateOperator`, params);
    return this._jsonRPCService.callOne(jsonRPCParam).pipe(map((data) => data.data));
  }
}
