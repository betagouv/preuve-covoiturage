import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TripChartComponent } from './components/trip-chart/trip-chart.component';


@NgModule({
  declarations: [
    TripChartComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    TripChartComponent,
  ],
})
export class UiTripModule {
}
