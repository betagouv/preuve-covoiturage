import { Component } from "@angular/core";
import { FormatedStatInterface } from "~/core/interfaces/stat/formatedStatInterface";
import { StatInterface } from "~/core/interfaces/stat/StatInterface";
import { ApiGraphTimeMode } from "~/modules/stat/services/ApiGraphTimeMode";
import { formatDayLabel, formatMonthLabel } from "~/modules/stat/stat-format";
import {
  commonOptions,
  monthOptionsTime,
  dayOptionsTime,
} from "../../../../../config/statChartOptions";

import { GraphTimeMode, GraphTimeModeLabel } from "../../../GraphTimeMode";
import { secondaryColor, StatGraphBase } from "../../stat-graph-base";

// define for each time mode the chart type
const graphTypes = {
  [GraphTimeMode.Day]: "bar",
  [GraphTimeMode.Month]: "bar",
};

// define for each time mode graph chart display option
const graphOptions = {
  [GraphTimeMode.Month]: {
    ...commonOptions,
    scales: {
      xAxes: [
        {
          ...commonOptions.scales.xAxes[0],
          time: {
            ...monthOptionsTime,
          },
        },
      ],
      yAxes: [
        {
          ...commonOptions.scales.yAxes[0],
        },
      ],
    },
    tooltips: {
      callbacks: {
        label(tooltipItem, data): string {
          return ` ${tooltipItem.yLabel} personnes`;
        },
      },
    },
  },
  [GraphTimeMode.Day]: {
    ...commonOptions,
    scales: {
      xAxes: [
        {
          ...commonOptions.scales.xAxes[0],
          time: {
            ...dayOptionsTime,
          },
        },
      ],
      yAxes: [
        {
          ...commonOptions.scales.yAxes[0],
        },
      ],
    },
    tooltips: {
      callbacks: {
        label(tooltipItem, data): string {
          return ` ${tooltipItem.yLabel} personnes`;
        },
      },
    },
  },
};

@Component({
  selector: "app-stat-graph-carpooler-vehicule",
  templateUrl: "./stat-graph-carpooler-vehicule.component.html",
  styleUrls: ["./stat-graph-carpooler-vehicule.component.scss"],
})
export class StatGraphCarpoolerVehiculeComponent extends StatGraphBase {
  graphTypes = graphTypes;
  graphOptions = graphOptions;

  format(
    apiDateMode: ApiGraphTimeMode,
    data: StatInterface[]
  ): FormatedStatInterface {
    const isMonth = apiDateMode === ApiGraphTimeMode.Month;

    return {
      datasets: [
        // Carpooler / car data set
        {
          backgroundColor: secondaryColor,
          borderColor: secondaryColor,
          data: data.map((entry) => entry.average_carpoolers_by_car),
          hoverBackgroundColor: secondaryColor,
        },
      ],
      graphTitle: this.graphTitle,
      labels: data.map((entry) =>
        isMonth ? formatMonthLabel(entry.month) : formatDayLabel(entry.day)
      ),
    } as any;
  }

  timeNavList: GraphTimeMode[] = [GraphTimeMode.Day, GraphTimeMode.Month];

  get graphTitle(): string {
    return `Personnes ${GraphTimeModeLabel[this.timeMode]}`;
  }
}
