import { NgModule } from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ChartModule } from 'primeng/chart';

import { StatisticsContentComponent } from './stats/component';

@NgModule({
  imports: [CommonModule, CardModule, ChartModule, InputSwitchModule, ProgressSpinnerModule],
  declarations: [StatisticsContentComponent],
  exports: [StatisticsContentComponent],
})
export class StatisticsUIModule {}
