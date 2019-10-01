import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import * as _ from 'lodash';

import { ApiService } from '~/core/services/api/api.service';
import { JsonRPCService } from '~/core/services/api/json-rpc.service';
import { Operator } from '~/core/entities/operator/operator';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';

@Injectable({
  providedIn: 'root',
})
export class OperatorService extends ApiService<Operator> {
  constructor(
    private _http: HttpClient,
    private _jsonRPC: JsonRPCService,
    private _authService: AuthenticationService,
  ) {
    super(_http, _jsonRPC, 'operator');
    this.load().subscribe();
  }

  get operatorsLoaded() {
    return this._loaded$.value;
  }

  get operator$(): Observable<Operator> {
    return this._entity$;
  }

  get operator(): Operator {
    return this._entity$.value;
  }

  get operators$(): Observable<Operator[]> {
    return this._entities$;
  }

  get operators(): Operator[] {
    return this._entities$.value;
  }

  set operatorToEdit(_id: string) {
    const operatorToEdit = this.operators.filter((operator) => operator._id === _id)[0];
    if (!operatorToEdit) {
      console.error('operator not found !');
    }
    this._entity$.next(operatorToEdit);
  }

  patchList(operator: Operator): Observable<[Operator, Operator[]]> {
    // remove null values & empty objects
    const removeEmpty = (object) => {
      if (!_.isObject(object)) {
        return;
      }

      _.keys(object).forEach((key) => {
        const element = object[key];

        if (element === null) {
          delete object[key];
          return;
        }

        if (_.isObject(element)) {
          if (_.isEmpty(element)) {
            delete object[key];
            return;
          }

          // Is object, recursive call
          removeEmpty(element);

          if (_.isEmpty(element)) {
            delete object[key];
            return;
          }
        }
      });
    };

    removeEmpty(operator);

    return super.patchList(operator);
  }

  getOperatorName(id: string) {
    const operator = this.entities.find((e) => e._id === id);
    return operator ? operator.nom_commercial : null;
  }

  loadConnectedOperator(): Observable<Operator> {
    if ('operator' in this._authService.user) {
      return this.loadOne({ _id: this._authService.user.operator });
    }
    throw Error();
  }

  setNewOperatorForCreation(): void {
    this._entity$.next(
      new Operator({
        _id: null,
        nom_commercial: null,
        raison_sociale: null,
      }),
    );
  }
}
