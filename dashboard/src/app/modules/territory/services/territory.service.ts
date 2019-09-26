import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

import * as _ from 'lodash';

import { JsonRPCService } from '~/core/services/api/json-rpc.service';
import { ApiService } from '~/core/services/api/api.service';
import { Territory } from '~/core/entities/territory/territory';
import { UserService } from '~/core/services/authentication/user.service';

@Injectable({
  providedIn: 'root',
})
export class TerritoryService extends ApiService<Territory> {
  constructor(private _http: HttpClient, private _jsonRPC: JsonRPCService, private _userService: UserService) {
    super(_http, _jsonRPC, 'territory');
  }

  get territoriesLoaded(): boolean {
    return this._loaded$.value;
  }

  get territory$(): Observable<Territory> {
    return this._entity$;
  }

  get territory(): Territory {
    return this._entity$.value;
  }
  get territories$(): Observable<Territory[]> {
    return this._entities$;
  }

  get territories(): Territory[] {
    return this._entities$.value;
  }

  patchList(territory: Territory): Observable<[Territory, Territory[]]> {
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

    removeEmpty(territory);

    return super.patchList(territory);
  }

  loadConnectedTerritory(): Observable<Territory> {
    if ('territory' in this._userService.user) {
      return this.loadOne({ _id: this._userService.user.territory });
    }
    throw Error();
  }

  set territoryToEdit(_id: string) {
    const territoryToEdit = this.territories.filter((territory) => territory._id === _id)[0];
    if (!territoryToEdit) {
      console.error('territory not found !');
    }
    this._entity$.next(territoryToEdit);
  }
}
