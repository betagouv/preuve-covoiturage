import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule, MatProgressSpinnerModule } from '@angular/material';

import { StatRoutingModule } from '~/modules/stat/stat-routing.module';
import { StatUIModule } from '~/modules/stat/modules/stat-ui/stat-ui.module';

import { StatFilteredService } from './services/stat-filtered.service';
import { PublicStatComponent } from './pages/public-stat/public-stat.component';

@NgModule({
  declarations: [PublicStatComponent],
  imports: [CommonModule, StatRoutingModule, StatUIModule, MatIconModule, MatProgressSpinnerModule],
  providers: [StatFilteredService],
})
export class StatModule {}
