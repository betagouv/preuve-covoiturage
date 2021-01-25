import { Component } from '@angular/core';
import { FormatedStatInterface } from '~/core/interfaces/stat/formatedStatInterface';
import { StatInterface } from '~/core/interfaces/stat/StatInterface';
import { ApiGraphTimeMode } from '~/modules/stat/services/ApiGraphTimeMode';
import { formatDayLabel, formatMonthLabel } from '~/modules/stat/stat-format';
import { commonOptions, monthOptionsTime, dayOptionsTime } from '../../../../../config/statChartOptions';

import { GraphTimeMode, GraphTimeModeLabel } from '../../../GraphTimeMode';
import { secondaryColor, StatGraphBase } from '../../stat-graph-base';

const graphTypes = {
  [GraphTimeMode.Day]: 'bar',
  [GraphTimeMode.Month]: 'bar',
  [GraphTimeMode.Cumulative]: 'line',
};

const graphOptions = {
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
          return ` ${tooltipItem.yLabel} km`;
        },
      },
    },
  },
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
          return ` ${tooltipItem.yLabel} km`;
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
          return ` ${tooltipItem.yLabel} km`;
        },
      },
    },
  },
};

@Component({
  selector: 'app-stat-graph-distance',
  templateUrl: './stat-graph-distance.component.html',
  styleUrls: ['./stat-graph-distance.component.scss'],
})
export class StatGraphDistanceComponent extends StatGraphBase {
  format(apiDateMode: ApiGraphTimeMode, data: StatInterface[]): FormatedStatInterface {
    const isMonth = apiDateMode === ApiGraphTimeMode.Month;
    const isCumulative = this.timeMode === GraphTimeMode.Cumulative;

    let cumulative = 0;

    return {
      datasets: [
        // Distance data set
        {
          backgroundColor: secondaryColor,
          borderColor: secondaryColor,
          data: isCumulative
            ? data.map((entry) => (cumulative += entry.distance))
            : data.map((entry) => entry.distance),
          hoverBackgroundColor: secondaryColor,
        },
      ],
      graphTitle: this.graphTitle,
      labels: data.map((entry) => (isMonth ? formatMonthLabel(entry.month) : formatDayLabel(entry.day))),
    } as any;
  }

  get graphOption() {
    return graphOptions[this.timeMode];
  }

  get graphType() {
    return graphTypes[this.timeMode];
  }

  graphOptions = graphOptions;

  get graphTitle(): string {
    return `Distance parcourue ${GraphTimeModeLabel[this.timeMode]}`;
  }
}
