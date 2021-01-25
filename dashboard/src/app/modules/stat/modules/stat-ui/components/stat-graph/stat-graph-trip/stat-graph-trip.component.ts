import { Component, Input } from '@angular/core';
import { FormatedStatInterface } from '~/core/interfaces/stat/formatedStatInterface';
import { StatInterface } from '~/core/interfaces/stat/StatInterface';
import { ApiGraphTimeMode } from '~/modules/stat/services/ApiGraphTimeMode';
import { formatDayLabel, formatMonthLabel } from '~/modules/stat/services/stat-format.service';
import { commonOptions, monthOptionsTime, dayOptionsTime } from '../../../../../config/statChartOptions';

import { GraphTimeMode, GraphTimeModeLabel } from '../../../GraphTimeMode';
import { secondaryColor, StatGraphBase } from '../../stat-graph-base';
import { primaryColor } from '../stat-graph.component';

// define for each time mode the chart type
const graphTypes = {
  [GraphTimeMode.Day]: 'bar',
  [GraphTimeMode.Month]: 'bar',
  [GraphTimeMode.Cumulative]: 'line',
};

// define for each time mode graph chart display option
const graphOptions = {
  [GraphTimeMode.Day]: {
    ...commonOptions,
    scales: {
      xAxes: [
        {
          ...commonOptions.scales.xAxes[0],
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
          return ` ${tooltipItem.yLabel} trajets`;
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
          return ` ${tooltipItem.yLabel} trajets`;
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
          ticks: {
            ...commonOptions.scales.yAxes[0].ticks,
            min: 1,
          },
        },
      ],
    },
    tooltips: {
      callbacks: {
        label(tooltipItem, data): string {
          return ` ${tooltipItem.yLabel} trajets`;
        },
      },
    },
  },
};

@Component({
  selector: 'app-stat-graph-trip',
  templateUrl: './stat-graph-trip.component.html',
  styleUrls: ['./stat-graph-trip.component.scss'],
})
export class StatGraphTripComponent extends StatGraphBase {
  @Input() displayNav = true;
  // @Input() data: any = null;

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
    let cumSubTrip = 0; // temp var for cumulative subsidized

    return {
      datasets: [
        // Subsidized trip data set
        {
          backgroundColor: primaryColor,
          borderColor: primaryColor,
          data: isCumulative
            ? data.map((entry) => (cumSubTrip += entry.trip_subsidized))
            : data.map((entry) => entry.trip_subsidized),
          hoverBackgroundColor: primaryColor,
        },
        // Trip data set
        {
          backgroundColor: secondaryColor,
          borderColor: secondaryColor,
          data: isCumulative ? data.map((entry) => (cumTrip += entry.trip)) : data.map((entry) => entry.trip),
          hoverBackgroundColor: secondaryColor,
        },
      ],
      graphTitle: this.graphTitle,
      labels: data.map((entry) => (isMonth ? formatMonthLabel(entry.month) : formatDayLabel(entry.day))),
    } as any;
  }

  ngOnInit() {
    super.ngOnInit();
  }

  get graphTitle(): string {
    return `Trajets ${GraphTimeModeLabel[this.timeMode]}`;
  }
}
