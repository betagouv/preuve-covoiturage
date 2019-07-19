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
} from '@angular/material';

@NgModule({
  declarations: [],
  imports: [
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatMenuModule,
    MatIconModule,
    MatTabsModule,
    MatStepperModule,
    MatProgressSpinnerModule,
  ],
  exports: [
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatMenuModule,
    MatIconModule,
    MatTabsModule,
    MatStepperModule,
    MatProgressSpinnerModule,
  ],
})
export class MaterialModule {}
