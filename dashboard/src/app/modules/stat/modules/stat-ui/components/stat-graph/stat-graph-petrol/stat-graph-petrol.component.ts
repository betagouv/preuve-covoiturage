import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
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
export class StatGraphPetrolComponent extends StatGraphBase implements OnChanges {
  // @Input() displayNav = true;
  @Input() data: any = null;

  graphOptions = graphOptions;
  timeNavList: GraphTimeMode[] = [GraphTimeMode.Cumulative, GraphTimeMode.Month];

  get graphTitle(): string {
    return `Essence économisée ${GraphTimeModeLabel[this.timeMode]}`;
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('>> ngOnChanges');
    if (changes.data) {
      console.log('data change ', changes.data);
    }
  }

  ngOnInit() {
    console.log('> init petrol graph');
    console.log('data', this.data);
  }

  format(apiDateMode: ApiGraphTimeMode, data: StatInterface[]): FormatedStatInterface {
    // TODO: implement
    return data as any;
  }
}
