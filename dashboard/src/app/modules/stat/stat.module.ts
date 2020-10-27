import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { StatRoutingModule } from '~/modules/stat/stat-routing.module';
import { StatUIModule } from '~/modules/stat/modules/stat-ui/stat-ui.module';

import { StatFilteredStoreService } from './services/stat-filtered-store.service';
import { PublicStatComponent } from './pages/public-stat/public-stat.component';

@NgModule({
  declarations: [PublicStatComponent],
  imports: [CommonModule, StatRoutingModule, StatUIModule, MatIconModule, MatProgressSpinnerModule],
  providers: [StatFilteredStoreService],
})
export class StatModule {}
