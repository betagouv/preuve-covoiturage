import { CrudStore } from '~/core/services/store/crud-store';
import { Contacts, Territory } from '~/core/entities/territory/territory';
import { Injectable } from '@angular/core';
import { TerritoryApiService } from '~/modules/territory/services/territoryApi.service';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TerritoryStoreService extends CrudStore<Territory, Territory, TerritoryApiService> {
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
}
