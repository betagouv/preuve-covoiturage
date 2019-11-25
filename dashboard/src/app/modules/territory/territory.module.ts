import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TerritoryApiService } from '~/modules/territory/services/territoryApi.service';
import { TerritoryStoreService } from '~/modules/territory/services/territoryStore.service';

@NgModule({
  declarations: [],
  providers: [TerritoryApiService, TerritoryStoreService],
  imports: [CommonModule],
})
export class TerritoryModule {}
