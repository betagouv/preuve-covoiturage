import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { DetailsContactComponent } from './components/details-contact/details-contact.component';

@NgModule({
  declarations: [DetailsContactComponent],
  imports: [CommonModule, MaterialModule],
  exports: [DetailsContactComponent],
})
export class DetailsModule {}
