import { Component } from '@angular/core';
import { FormatedStatInterface } from '~/core/interfaces/stat/formatedStatInterface';
import { StatInterface } from '~/core/interfaces/stat/StatInterface';
import { petrolFactor } from '~/modules/stat/config/stat';
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
          return ` ${tooltipItem.yLabel} litres`;
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
          return ` ${tooltipItem.yLabel} litres`;
        },
      },
    },
  },
};

@Component({
  selector: 'app-stat-graph-petrol',
  templateUrl: './stat-graph-petrol.component.html',
  styleUrls: ['./stat-graph-petrol.component.scss'],
})
export class StatGraphPetrolComponent extends StatGraphBase {
  graphTypes = graphTypes;
  graphOptions = graphOptions;

  timeNavList: GraphTimeMode[] = [GraphTimeMode.Cumulative, GraphTimeMode.Month];

  get graphTitle(): string {
    return `Essence économisée ${GraphTimeModeLabel[this.timeMode]}`;
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
            ? data.map((entry) => (cumTrip += entry.distance * petrolFactor))
            : data.map((entry) => entry.distance * petrolFactor),
          hoverBackgroundColor: secondaryColor,
        },
      ],
      graphTitle: this.graphTitle,
      labels: data.map((entry) => (isMonth ? formatMonthLabel(entry.month) : formatDayLabel(entry.day))),
    } as any;
  }
}
