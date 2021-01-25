import { Component } from '@angular/core';
import { FormatedStatInterface } from '~/core/interfaces/stat/formatedStatInterface';
import { StatInterface } from '~/core/interfaces/stat/StatInterface';
import { ApiGraphTimeMode } from '~/modules/stat/services/ApiGraphTimeMode';
import { formatDayLabel, formatMonthLabel } from '~/modules/stat/stat-format';
import { commonOptions, monthOptionsTime, dayOptionsTime } from '../../../../../config/statChartOptions';

import { GraphTimeMode, GraphTimeModeLabel } from '../../../GraphTimeMode';
import { secondaryColor, StatGraphBase } from '../../stat-graph-base';

// define for each time mode the chart type
const graphTypes = {
  [GraphTimeMode.Day]: 'bar',
  [GraphTimeMode.Month]: 'bar',
  [GraphTimeMode.Cumulative]: 'line',
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
          return ` ${tooltipItem.yLabel} covoitureurs`;
        },
      },
    },
  },
  [GraphTimeMode.Cumulative]: {
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
          return ` ${tooltipItem.yLabel} covoitureurs`;
        },
      },
    },
  },
};

@Component({
  selector: 'app-stat-graph-carpoolers',
  templateUrl: './stat-graph-carpoolers.component.html',
  styleUrls: ['./stat-graph-carpoolers.component.scss'],
})
export class StatGraphCarpoolersComponent extends StatGraphBase {
  get graphOption() {
    return graphOptions[this.timeMode];
  }

  get graphType() {
    return graphTypes[this.timeMode];
  }

  format(apiDateMode: ApiGraphTimeMode, data: StatInterface[]): FormatedStatInterface {
    const isMonth = apiDateMode === ApiGraphTimeMode.Month;
    const isCumulative = this.timeMode === GraphTimeMode.Cumulative;

    let cumTrip = 0; // temp var for cumulative subsidized

    return {
      datasets: [
        // Trip data set
        {
          backgroundColor: secondaryColor,
          borderColor: secondaryColor,
          data: isCumulative
            ? data.map((entry) => (cumTrip += entry.carpoolers))
            : data.map((entry) => entry.carpoolers),
          hoverBackgroundColor: secondaryColor,
        },
      ],
      graphTitle: this.graphTitle,
      labels: data.map((entry) => (isMonth ? formatMonthLabel(entry.month) : formatDayLabel(entry.day))),
    } as any;
  }

  graphOptions = graphOptions;
  timeNavList: GraphTimeMode[] = [GraphTimeMode.Cumulative, GraphTimeMode.Month];

  get graphTitle(): string {
    return `Covoitureurs ${GraphTimeModeLabel[this.timeMode]}`;
  }
}
