import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '~/shared/shared.module';

import { StatNumberComponent } from './components/stat-number/stat-number.component';
import { StatGraphComponent } from './components/stat-graph/stat-graph.component';
import { StatViewComponent } from './components/stat-view/stat-view.component';

@NgModule({
  declarations: [StatNumberComponent, StatGraphComponent, StatViewComponent],
  imports: [CommonModule, SharedModule],
  exports: [StatGraphComponent, StatViewComponent],
})
export class StatUIModule {}
