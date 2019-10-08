import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DetailsContactComponent } from '~/shared/modules/details/components/details-contact/details-contact.component';
import { MaterialModule } from '~/shared/modules/material/material.module';

@NgModule({
  declarations: [DetailsContactComponent],
  imports: [CommonModule, MaterialModule],
  exports: [DetailsContactComponent],
})
export class DetailsModule {}
