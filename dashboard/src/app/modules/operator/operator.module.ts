import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SharedModule } from '~/shared/shared.module';
import { MaterialModule } from '~/shared/modules/material/material.module';

@NgModule({
  declarations: [],
  imports: [CommonModule, SharedModule, RouterModule, MaterialModule],
})
export class OperatorModule {}
