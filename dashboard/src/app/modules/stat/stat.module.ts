import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StatRoutingModule } from '~/modules/stat/stat-routing.module';

import { StatFilteredService } from './services/stat-filtered.service';
import { PublicStatComponent } from './pages/public-stat/public-stat.component';
import { StatUIModule } from '~/modules/stat/modules/stat-ui/stat-ui.module';
import { MatIconModule, MatProgressSpinnerModule } from '@angular/material';

@NgModule({
  declarations: [PublicStatComponent],
  imports: [CommonModule, StatRoutingModule, StatUIModule, MatIconModule, MatProgressSpinnerModule],
  providers: [StatFilteredService],
})
export class StatModule {}
