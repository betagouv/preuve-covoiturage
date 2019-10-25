import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '~/shared/shared.module';
import { MaterialModule } from '~/shared/modules/material/material.module';

// tslint:disable-next-line:max-line-length
import { OperatorVisibilityTreeComponent } from './components/operator-visibility-tree/operator-visibility-tree.component';
import { MatTreeModule } from '@angular/material';

@NgModule({
  declarations: [OperatorVisibilityTreeComponent],
  exports: [OperatorVisibilityTreeComponent],
  imports: [CommonModule, SharedModule, FormsModule, MaterialModule, ReactiveFormsModule, MatTreeModule],
})
export class OperatorVisibilityModule {}
