import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import * as _ from 'lodash';

import { JsonRPCService } from '~/core/services/api/json-rpc.service';
import { ApiService } from '~/core/services/api/api.service';
import { Territory } from '~/core/entities/territory/territory';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { IModel } from '~/core/entities/IModel';
import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';

@Injectable({
  providedIn: 'root',
})
export class TerritoryService extends ApiService<Territory> {
  constructor(
    private _http: HttpClient,
    private _jsonRPC: JsonRPCService,
    private _authService: AuthenticationService,
  ) {
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

  private removeEmpty(object) {
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
        this.removeEmpty(element);

        if (_.isEmpty(element)) {
          delete object[key];
          return;
        }
      }
    });
  }

  patchList(territory: Territory): Observable<[Territory, Territory[]]> {
    this.removeEmpty(territory);

    return super.patchList(territory);
  }

  updateList(territory: Territory): Observable<[Territory, Territory[]]> {
    this.removeEmpty(territory);

    return super.updateList(territory);
  }

  public patchContactList(item: IModel): Observable<[Territory, Territory[]]> {
    this.removeEmpty(item);

    const jsonRPCParam = JsonRPCParam.createPatchParam(`${this._method}:patchContacts`, item);
    return this._jsonRPCService.callOne(jsonRPCParam).pipe(
      map((data) => data.data),
      mergeMap((modifiedEntity: Territory) => {
        console.log(`updated ${this._method} id=${modifiedEntity._id}`);
        this._entity$.next(modifiedEntity);
        return this.load(this._listFilters).pipe(
          map((entities) => <[Territory, Territory[]]>[modifiedEntity, entities]),
        );
      }),
    );
  }

  loadConnectedTerritory(): Observable<Territory> {
    if ('territory' in this._authService.user) {
      return this.loadOne({ _id: this._authService.user.territory });
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
