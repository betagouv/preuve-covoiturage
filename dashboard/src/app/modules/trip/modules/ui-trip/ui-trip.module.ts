import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '~/shared/modules/material/material.module';
import { SharedModule } from '~/shared/shared.module';

import { TripTableComponent } from './components/trip-table/trip-table.component';
import { TripExportComponent } from './components/trip-export/trip-export.component';

@NgModule({
  declarations: [TripTableComponent, TripExportComponent],
  imports: [CommonModule, MaterialModule, ReactiveFormsModule, SharedModule],
  exports: [TripTableComponent, TripExportComponent],
})
export class UiTripModule {}
