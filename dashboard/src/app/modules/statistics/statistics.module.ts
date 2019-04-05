/* Angular imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


/* External modules */
import { ChartModule } from 'primeng/chart';
import { SelectButtonModule } from 'primeng/selectbutton';


/* Shared modules */

/* Local modules */
import { StatisticsRoutingModule } from './statistics.routing';

/* Local components */
import { StatisticsPageComponent } from './pages/statistics/component';
import { StatisticsNumberComponent } from './components/number/component';

/* Local services */
import { StatisticsService } from './services/statisticsService';
import { StatisticsHeaderComponent } from './layout/components/header/component';

@NgModule({
  imports: [
    StatisticsRoutingModule,
    ChartModule,
    FormsModule,
    CommonModule,
    SelectButtonModule,
  ],
  providers: [
    StatisticsService,
  ],
  declarations: [
    StatisticsPageComponent,
    StatisticsNumberComponent,
    StatisticsHeaderComponent,
  ],
  exports: [
  ],
})
export class StatisticsModule { }
