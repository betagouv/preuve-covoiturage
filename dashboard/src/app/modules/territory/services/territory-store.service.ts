import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';

import { CrudStore } from '~/core/services/store/crud-store';
import { Contacts, Territory } from '~/core/entities/territory/territory';
import { TerritoryApiService } from '~/modules/territory/services/territory-api.service';

@Injectable({
  providedIn: 'root',
})
export class TerritoryStoreService extends CrudStore<Territory, Territory, any, TerritoryApiService> {
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
