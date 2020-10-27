import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTreeModule } from '@angular/material/tree';

import { SharedModule } from '~/shared/shared.module';
import { MaterialModule } from '~/shared/modules/material/material.module';

// eslint-disable-next-line
import { OperatorVisibilityTreeComponent } from './components/operator-visibility-tree/operator-visibility-tree.component';

@NgModule({
  declarations: [OperatorVisibilityTreeComponent],
  exports: [OperatorVisibilityTreeComponent],
  imports: [CommonModule, SharedModule, FormsModule, MaterialModule, ReactiveFormsModule, MatTreeModule],
})
export class OperatorVisibilityModule {}
