/* Angular imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/* External modules */
import { ProgressSpinnerModule } from 'primeng/progressspinner';

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
    ProgressSpinnerModule,
    StatisticsUIModule,
  ],
  providers: [
    StatisticsService,
  ],
  declarations: [
    StatisticsPageComponent,
    StatisticsHeaderComponent,
  ],
  exports: [],
})
export class StatisticsModule {
}
