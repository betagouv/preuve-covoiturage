/* Angular imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/* External modules */
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { InputSwitchModule } from 'primeng/inputswitch';

/* Local modules */
import { StatisticsRoutingModule } from './statistics.routing';
import { StatisticsUIModule } from './modules/ui/ui.module';

/* Local components */
import { StatisticsPageComponent } from './pages/statistics/component';

/* Local services */
import { StatisticsService } from './services/statisticsService';
import { StatisticsHeaderComponent } from './layout/components/header/component';

/* Shared modules */

@NgModule({
  imports: [
    StatisticsRoutingModule,
    CommonModule,
    CardModule,
    ChartModule,
    InputSwitchModule,
    ProgressSpinnerModule,
    StatisticsUIModule,
  ],
  providers: [StatisticsService],
  declarations: [StatisticsPageComponent, StatisticsHeaderComponent],
  exports: [],
})
export class StatisticsModule {}
