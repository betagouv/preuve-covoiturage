import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '~/shared/material/material.module';
import { SharedModule } from '~/shared/shared.module';

@NgModule({
  declarations: [],
  imports: [CommonModule, SharedModule, MaterialModule],
})
export class UserModule {}
