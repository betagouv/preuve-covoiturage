import { NgModule } from '@angular/core';
import {
  MatButtonModule,
  MatCheckboxModule,
  MatIconModule,
  MatInputModule,
  MatMenuModule,
  MatSelectModule,
  MatProgressSpinnerModule,
  MatStepperModule,
  MatTabsModule,
  MatTableModule,
  MatSortModule,
  MatProgressBarModule,
  MatTooltipModule,
} from '@angular/material';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@NgModule({
  declarations: [],
  imports: [
    MatButtonModule,
    MatButtonToggleModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatMenuModule,
    MatIconModule,
    MatTabsModule,
    MatStepperModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatSortModule,
    MatProgressBarModule,
    MatTooltipModule,
  ],
  exports: [
    MatButtonModule,
    MatButtonToggleModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatMenuModule,
    MatIconModule,
    MatTabsModule,
    MatStepperModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatSortModule,
    MatProgressBarModule,
    MatTooltipModule,
  ],
})
export class MaterialModule {}
