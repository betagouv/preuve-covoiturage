import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '~/shared/modules/material/material.module';
import { StatRoutingModule } from '~/modules/stat/stat-routing.module';

import { StatFilteredService } from './services/stat-filtered.service';
import { TempPublicStatsComponent } from './pages/temp-public-stats/temp-public-stats.component';

@NgModule({
  declarations: [TempPublicStatsComponent],
  imports: [CommonModule, MaterialModule, StatRoutingModule],
  providers: [StatFilteredService],
})
export class StatModule {}
