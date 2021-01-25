import { Component, Input } from '@angular/core';
import { FormatedStatInterface } from '~/core/interfaces/stat/formatedStatInterface';
import { StatInterface } from '~/core/interfaces/stat/StatInterface';
import { ApiGraphTimeMode } from '~/modules/stat/services/ApiGraphTimeMode';
import { commonOptions, monthOptionsTime, dayOptionsTime } from '../../../../../config/statChartOptions';

import { GraphTimeMode, GraphTimeModeLabel } from '../../../GraphTimeMode';
import { StatGraphBase } from '../../stat-graph-base';

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
          return ` ${tooltipItem.yLabel} kg`;
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
          return ` ${tooltipItem.yLabel} kg`;
        },
      },
    },
  },
};

@Component({
  selector: 'app-stat-graph-carbon',
  templateUrl: './stat-graph-carbon.component.html',
  styleUrls: ['./stat-graph-carbon.component.scss'],
})
export class StatGraphCarbonComponent extends StatGraphBase {
  format(apiDateMode: ApiGraphTimeMode, data: StatInterface[]): FormatedStatInterface {
    throw new Error('Method not implemented.');
  }
  @Input() data: any = null;

  graphOptions = graphOptions;
  timeNavList: GraphTimeMode[] = [GraphTimeMode.Cumulative, GraphTimeMode.Month];

  get graphTitle(): string {
    return `Co2 économisée ${GraphTimeModeLabel[this.timeMode]}`;
  }
}
