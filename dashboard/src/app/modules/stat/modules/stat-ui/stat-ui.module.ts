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
// eslint-disable-next-line
import { StatChartContainerComponent } from './components/stat-graph/stat-chart-container/stat-chart-container.component';
import { StatGraphDistanceComponent } from './components/stat-graph/stat-graph-distance/stat-graph-distance.component';
import { StatGraphTimeModeNavComponent } from './components/stat-graph/stat-graph-timemode-nav/stat-graph-timemode-nav.component';
import { StatGraphTripComponent } from './components/stat-graph/stat-graph-trip/stat-graph-trip.component';
import { StatGraphCarpoolersComponent } from './components/stat-graph/stat-graph-carpoolers/stat-graph-carpoolers.component';
import { StatGraphPetrolComponent } from './components/stat-graph/stat-graph-petrol/stat-graph-petrol.component';
import { StatGraphCarbonComponent } from './components/stat-graph/stat-graph-carbon/stat-graph-carbon.component';
import { StatGraphCarpoolerVehiculeComponent } from './components/stat-graph/stat-graph-carpooler-vehicule/stat-graph-carpooler-vehicule.component';

@NgModule({
  declarations: [
    StatNumberComponent,
    StatGraphComponent,
    StatTerritoryViewComponent,
    StatGraphViewComponent,
    StatOperatorViewComponent,
    StatChartContainerComponent,
    StatGraphDistanceComponent,
    StatGraphTimeModeNavComponent,
    StatGraphTripComponent,
    StatGraphCarpoolersComponent,
    StatGraphPetrolComponent,
    StatGraphCarbonComponent,
    StatGraphCarpoolerVehiculeComponent,
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
