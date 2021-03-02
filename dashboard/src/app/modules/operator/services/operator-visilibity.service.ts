import { BehaviorSubject, Observable } from 'rxjs';
import { finalize, map, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';

import { JsonRPCService } from '~/core/services/api/json-rpc.service';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { OperatorVisibilityType } from '~/core/interfaces/operator/operatorVisibilityType';
import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';

@Injectable({
  providedIn: 'root',
})
export class OperatorVisilibityService {
  private _entity$ = new BehaviorSubject<OperatorVisibilityType>(null);

  private _loading$ = new BehaviorSubject<boolean>(false);
  private _loaded$ = new BehaviorSubject<boolean>(false);

  private _method = 'territory';

  constructor(private _jsonRPCService: JsonRPCService, private auth: AuthenticationService) {}

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

    const jsonRPCParam = new JsonRPCParam(`${this._method}:listOperator`, {
      operator_id: this.auth.user.operator_id,
    });

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

  public update(territories: number[]): Observable<OperatorVisibilityType> {
    const jsonRPCParam = new JsonRPCParam(`${this._method}:updateOperator`, {
      operator_id: this.auth.user.operator_id,
      territory_id: territories,
    });

    return this._jsonRPCService.callOne(jsonRPCParam).pipe(map((data) => data.data));
  }
}
