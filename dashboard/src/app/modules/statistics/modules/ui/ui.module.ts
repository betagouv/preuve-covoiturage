import { NgModule } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';

import { StatisticsResumeComponent } from './components/resume/component';
import { StatisticsGraphsComponent } from './components/graphs/component';
import { StatisticsNumberComponent } from './components/number/component';
import { StatisticsService } from '../../services/statisticsService';

@NgModule({
  imports: [
    CommonModule,
    ChartModule,
    CardModule,
    SelectButtonModule,
    FormsModule,
  ],
  providers: [
    StatisticsService,
  ],
  declarations: [
    StatisticsResumeComponent,
    StatisticsGraphsComponent,
    StatisticsNumberComponent,
  ],
  exports: [
    StatisticsResumeComponent,
    StatisticsGraphsComponent,
    StatisticsNumberComponent,
  ],
})
export class StatisticsUIModule {
}
