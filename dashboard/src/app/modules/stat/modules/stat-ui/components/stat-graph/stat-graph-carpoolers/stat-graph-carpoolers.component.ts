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
  format(apiDateMode: ApiGraphTimeMode, data: StatInterface[]): FormatedStatInterface {
    throw new Error('Method not implemented.');
  }
  // @Input() displayNav = true;
  @Input() data: any = null;

  graphOptions = graphOptions;
  timeNavList: GraphTimeMode[] = [GraphTimeMode.Cumulative, GraphTimeMode.Month];

  get graphTitle(): string {
    return `Covoitureurs ${GraphTimeModeLabel[this.timeMode]}`;
  }
}
