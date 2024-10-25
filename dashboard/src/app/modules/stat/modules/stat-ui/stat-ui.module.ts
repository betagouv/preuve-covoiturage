/* eslint-disable max-len */
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ChartjsModule } from "@ctrl/ngx-chartjs";
import { MaterialModule } from "../../../../shared/modules/material/material.module";
import { SharedModule } from "../../../../shared/shared.module";
import { StatGraphViewComponent } from "./components/stat-graph-view/stat-graph-view.component";
import { StatChartContainerComponent } from "./components/stat-graph/stat-chart-container/stat-chart-container.component";
import { StatGraphCarbonComponent } from "./components/stat-graph/stat-graph-carbon/stat-graph-carbon.component";
import { StatGraphCarpoolerVehiculeComponent } from "./components/stat-graph/stat-graph-carpooler-vehicule/stat-graph-carpooler-vehicule.component";
import { StatGraphCarpoolersComponent } from "./components/stat-graph/stat-graph-carpoolers/stat-graph-carpoolers.component";
import { StatGraphDistanceComponent } from "./components/stat-graph/stat-graph-distance/stat-graph-distance.component";
import { StatGraphPetrolComponent } from "./components/stat-graph/stat-graph-petrol/stat-graph-petrol.component";
import { StatGraphTimeModeNavComponent } from "./components/stat-graph/stat-graph-timemode-nav/stat-graph-timemode-nav.component";
import { StatGraphTripComponent } from "./components/stat-graph/stat-graph-trip/stat-graph-trip.component";
import { StatGraphComponent } from "./components/stat-graph/stat-graph.component";
import { StatNumbersNavComponent } from "./components/stat-graph/stat-numbers-nav/stat-numbers-nav.component";

@NgModule({
  declarations: [
    StatChartContainerComponent,
    StatGraphCarbonComponent,
    StatGraphCarpoolersComponent,
    StatGraphCarpoolerVehiculeComponent,
    StatGraphComponent,
    StatGraphDistanceComponent,
    StatGraphPetrolComponent,
    StatGraphTimeModeNavComponent,
    StatGraphTripComponent,
    StatGraphViewComponent,
    StatNumbersNavComponent,
  ],
  imports: [
    CommonModule,
    ChartjsModule,
    FormsModule,
    MaterialModule,
    SharedModule,
  ],
  exports: [StatGraphComponent, StatGraphViewComponent],
})
export class StatUIModule {}
