import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TerritoryApiService } from '~/modules/territory/services/territory-api.service';
import { TerritoryStoreService } from '~/modules/territory/services/territory-store.service';

@NgModule({
  declarations: [],
  providers: [TerritoryApiService, TerritoryStoreService],
  imports: [CommonModule],
})
export class TerritoryModule {}
