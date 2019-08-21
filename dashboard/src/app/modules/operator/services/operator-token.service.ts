import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { ApiService } from '~/core/services/api/api.service';
import { OperatorToken } from '~/core/entities/operator/operatorToken';
import { JsonRPCService } from '~/core/services/api/json-rpc.service';
import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import { OperatorTokenInterface } from '~/core/interfaces/operator/operatorTokenInterface';

@Injectable({
  providedIn: 'root',
})
export class OperatorTokenService extends ApiService<OperatorTokenInterface> {
  constructor(private _http: HttpClient, private _jsonRPC: JsonRPCService) {
    super(_http, _jsonRPC, 'application');
  }

  get operatorTokens$(): Observable<OperatorTokenInterface[]> {
    return this._entities$;
  }

  get operatorTokens(): OperatorTokenInterface[] {
    return this._entities$.value;
  }

  public createToken(item: OperatorToken): Observable<{ token: string }> {
    const jsonRPCParam = new JsonRPCParam(`${this._method}.create`, item);
    return this._jsonRPC.call(jsonRPCParam).pipe(
      tap((entity) => {
        const auxArray = this._entities$.value;
        auxArray.push(entity);
        this._entities$.next(auxArray);
        console.log(`created ${this._method} id=${entity._id}`);
      }),
    );
  }
}
