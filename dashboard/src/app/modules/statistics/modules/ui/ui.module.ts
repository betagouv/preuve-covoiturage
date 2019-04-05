import { NgModule } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';

import { StatisticsResumeComponent } from '~/modules/statistics/modules/ui/components/resume/component';
import { StatisticsGraphsComponent } from '~/modules/statistics/modules/ui/components/graphs/component';
import { StatisticsNumberComponent } from '~/modules/statistics/modules/ui/components/number/component';

@NgModule({
  imports: [
    CommonModule,
    ChartModule,
    CardModule,
    SelectButtonModule,
    FormsModule,
  ],
  providers: [
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
