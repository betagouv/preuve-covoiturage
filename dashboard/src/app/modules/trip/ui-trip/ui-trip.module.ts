import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '~/shared/material/material.module';

import { TripChartComponent } from './components/trip-chart/trip-chart.component';
import { TripTableComponent } from './components/trip-table/trip-table.component';

@NgModule({
  declarations: [TripChartComponent, TripTableComponent],
  imports: [CommonModule, MaterialModule],
  exports: [TripChartComponent, TripTableComponent],
})
export class UiTripModule {}
