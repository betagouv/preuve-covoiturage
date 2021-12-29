import { Injectable } from '@angular/core';
import { Territory, TerritoryFormModel } from '~/core/entities/territory/territory';
import { CrudStore } from '~/core/services/store/crud-store';
import { TerritoryApiService } from '~/modules/territory/services/territory-api.service';

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
}
