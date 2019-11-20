import { CrudStore } from '~/core/services/store/crud-store';
import { Territory } from '~/core/entities/territory/territory';
import { Injectable } from '@angular/core';
import { TerritoryApiService } from '~/modules/territory/services/territoryApiService';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TerritoryStoreService extends CrudStore<Territory, Territory, TerritoryApiService> {
  constructor(protected territoryApi: TerritoryApiService) {
    super(territoryApi, Territory);
  }

  patchContact(formData: any): Observable<Territory> {
    return this.rpcCrud.patchContact(formData).pipe(
      tap((territory) => {
        this.entitySubject.next(territory);
        this.loadList();
      }),
    );
  }
}
