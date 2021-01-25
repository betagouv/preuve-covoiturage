import { Component, Input } from '@angular/core';
import { FormatedStatInterface } from '~/core/interfaces/stat/formatedStatInterface';
import { StatInterface } from '~/core/interfaces/stat/StatInterface';
import { ApiGraphTimeMode } from '~/modules/stat/services/ApiGraphTimeMode';
import { commonOptions, monthOptionsTime, dayOptionsTime } from '../../../../../config/statChartOptions';

import { GraphTimeMode, GraphTimeModeLabel } from '../../../GraphTimeMode';
import { StatGraphBase } from '../../stat-graph-base';

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
    throw new Error('Method not implemented.');
  }
  // @Input() displayNav = true;
  @Input() data: any = null;

  graphOptions = graphOptions;

  get graphTitle(): string {
    return `Distance parcourue ${GraphTimeModeLabel[this.timeMode]}`;
  }
}
