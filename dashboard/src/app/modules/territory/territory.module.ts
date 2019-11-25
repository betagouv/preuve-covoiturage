import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TerritoryApiService } from '~/modules/territory/services/territoryApiService';
import { TerritoryStoreService } from '~/modules/territory/services/territoryStoreService';

@NgModule({
  declarations: [],
  providers: [TerritoryApiService, TerritoryStoreService],
  imports: [CommonModule],
})
export class TerritoryModule {}
