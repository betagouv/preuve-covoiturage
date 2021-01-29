import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartjsModule } from '@ctrl/ngx-chartjs';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '~/shared/shared.module';
import { MaterialModule } from '~/shared/modules/material/material.module';

import { StatGraphComponent } from './components/stat-graph/stat-graph.component';
import { StatGraphViewComponent } from './components/stat-graph-view/stat-graph-view.component';
// eslint-disable-next-line
import { StatChartContainerComponent } from './components/stat-graph/stat-chart-container/stat-chart-container.component';
import { StatGraphDistanceComponent } from './components/stat-graph/stat-graph-distance/stat-graph-distance.component';
// eslint-disable-next-line
import { StatGraphTimeModeNavComponent } from './components/stat-graph/stat-graph-timemode-nav/stat-graph-timemode-nav.component';
import { StatGraphTripComponent } from './components/stat-graph/stat-graph-trip/stat-graph-trip.component';
// eslint-disable-next-line
import { StatGraphCarpoolersComponent } from './components/stat-graph/stat-graph-carpoolers/stat-graph-carpoolers.component';
import { StatGraphPetrolComponent } from './components/stat-graph/stat-graph-petrol/stat-graph-petrol.component';
import { StatGraphCarbonComponent } from './components/stat-graph/stat-graph-carbon/stat-graph-carbon.component';
// eslint-disable-next-line
import { StatGraphCarpoolerVehiculeComponent } from './components/stat-graph/stat-graph-carpooler-vehicule/stat-graph-carpooler-vehicule.component';
import { StatNumbersNavComponent } from './components/stat-graph/stat-numbers-nav/stat-numbers-nav.component';
import { StatViewComponent } from './components/stat-view/stat-view.component';

@NgModule({
  declarations: [
    StatGraphComponent,
    StatViewComponent,
    StatGraphViewComponent,
    StatChartContainerComponent,
    StatGraphDistanceComponent,
    StatGraphTimeModeNavComponent,
    StatGraphTripComponent,
    StatGraphCarpoolersComponent,
    StatGraphPetrolComponent,
    StatGraphCarbonComponent,
    StatGraphCarpoolerVehiculeComponent,
    StatNumbersNavComponent,
  ],
  imports: [CommonModule, ChartjsModule, FormsModule, MaterialModule, SharedModule],
  exports: [StatGraphComponent, StatViewComponent, StatGraphViewComponent],
})
export class StatUIModule {}
