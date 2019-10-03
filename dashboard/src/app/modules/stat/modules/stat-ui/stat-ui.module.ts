import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartjsModule } from '@ctrl/ngx-chartjs';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '~/shared/shared.module';
import { MaterialModule } from '~/shared/modules/material/material.module';

import { StatNumberComponent } from './components/stat-number/stat-number.component';
import { StatGraphComponent } from './components/stat-graph/stat-graph.component';
import { StatTerritoryViewComponent } from './components/stat-territory-view/stat-territory-view.component';
import { StatGraphViewComponent } from './components/stat-graph-view/stat-graph-view.component';
import { StatOperatorViewComponent } from './components/stat-operator-view/stat-operator-view.component';

@NgModule({
  declarations: [
    StatNumberComponent,
    StatGraphComponent,
    StatTerritoryViewComponent,
    StatGraphViewComponent,
    StatOperatorViewComponent,
  ],
  imports: [CommonModule, ChartjsModule, FormsModule, MaterialModule, SharedModule],
  exports: [
    StatGraphComponent,
    StatTerritoryViewComponent,
    StatGraphViewComponent,
    StatNumberComponent,
    StatOperatorViewComponent,
  ],
})
export class StatUIModule {}
