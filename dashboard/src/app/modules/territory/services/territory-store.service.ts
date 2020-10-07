import { Observable } from 'rxjs';
import { tap, finalize, takeUntil, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';

import {
  SortEnum,
  allBasicFieldEnum,
  RelationFieldEnum,
  CompanyEnum,
  GeoFieldEnum,
  TerritoryCodeEnum,
} from '../TerritoryQueryInterface';

import { CrudStore } from '~/core/services/store/crud-store';
import { Territory, TerritoryFormModel } from '~/core/entities/territory/territory';
import { TerritoryApiService } from '~/modules/territory/services/territory-api.service';
import { Contacts } from '~/core/entities/shared/contacts';

@Injectable({
  providedIn: 'root',
})
export class TerritoryStoreService extends CrudStore<
  Territory,
  Territory,
  any,
  TerritoryApiService,
  TerritoryFormModel
> {
  constructor(protected territoryApi: TerritoryApiService) {
    super(territoryApi, Territory);
  }

  patchContact(contactFormData: any, id: number): Observable<Territory> {
    return this.rpcCrud.patchContact({ patch: new Contacts(contactFormData), _id: id }).pipe(
      tap((territory) => {
        this.entitySubject.next(territory);
        this.loadList();
      }),
    );
  }

  public getById(id: number): Observable<Territory> {
    this.dismissGetSubject.next();
    this._loadCount += 1;
    return (this.rpcCrud as TerritoryApiService)
      .find(
        {
          _id: id,
        },
        [SortEnum.NameAsc],
        [
          ...allBasicFieldEnum,
          RelationFieldEnum.Children,
          RelationFieldEnum.Parent,
          CompanyEnum.Siret,
          GeoFieldEnum.Geo,
          TerritoryCodeEnum.Insee,
        ],
      )
      .pipe(
        finalize(() => {
          if (this._loadCount > 0) this._loadCount -= 1;
        }),
        takeUntil(this.dismissGetSubject),
        map((entity) => new this.modelType().map(entity)),
        tap((entity) => {
          this.entitySubject.next(entity);
        }),
      );
  }
}
