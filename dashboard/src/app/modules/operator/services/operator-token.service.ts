import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { ApiService } from '~/core/services/api/api.service';
import { OperatorToken } from '~/core/entities/operator/operatorToken';
import { JsonRPCService } from '~/core/services/api/json-rpc.service';
import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import { OperatorTokenInterface } from '~/core/interfaces/operator/operatorTokenInterface';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';

@Injectable({
  providedIn: 'root',
})
export class OperatorTokenService extends ApiService<OperatorTokenInterface> {
  constructor(
    private _http: HttpClient,
    private _jsonRPC: JsonRPCService,
    private _authService: AuthenticationService,
  ) {
    super(_http, _jsonRPC, 'application');
  }

  get loaded(): boolean {
    return this._loaded$.value;
  }

  get operatorTokens$(): Observable<OperatorTokenInterface[]> {
    return this._entities$;
  }

  get operatorTokens(): OperatorTokenInterface[] {
    return this._entities$.value;
  }

  load(): Observable<OperatorTokenInterface[]> {
    if ('operator' in this._authService.user) {
      const operatorId = this._authService.user.operator;
      return super.load({
        operator_id: operatorId,
      });
    }
    console.log('only operator users can create application tokens');
    throw Error();
  }

  public createToken(applicationName: OperatorToken): Observable<{ token: string }> {
    if ('operator' in this._authService.user) {
      const operatorId = this._authService.user.operator;
      const jsonRPCParam = new JsonRPCParam(`${this._method}:create`, {
        operator_id: operatorId,
        permissions: ['journey.create'],
        ...applicationName,
      });
      return this._jsonRPC.callOne(jsonRPCParam).pipe(map((data) => data.data));
    }
    console.log('only operator users can create application tokens');
    throw Error();
  }
}
