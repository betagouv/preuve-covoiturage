import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '~/shared/material/material.module';

import { TripTableComponent } from './components/trip-table/trip-table.component';

@NgModule({
  declarations: [TripTableComponent],
  imports: [CommonModule, MaterialModule],
  exports: [TripTableComponent],
})
export class UiTripModule {}
