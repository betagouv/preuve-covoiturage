/* Angular imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/* Local modules */
import { StatisticsRoutingModule } from './statistics.routing';

/* Local components */
import { StatisticsPageComponent } from './pages/statistics/component';

/* Local services */
import { StatisticsService } from './services/statisticsService';
import { StatisticsHeaderComponent } from './layout/components/header/component';
import { StatisticsUIModule } from './modules/ui/ui.module';

/* Shared modules */
@NgModule({
  imports: [CommonModule, StatisticsRoutingModule, StatisticsUIModule],
  providers: [StatisticsService],
  declarations: [StatisticsPageComponent, StatisticsHeaderComponent],
  exports: [StatisticsUIModule],
})
export class StatisticsModule {}
