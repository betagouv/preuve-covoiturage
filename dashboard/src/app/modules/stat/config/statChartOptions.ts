import { ChartOptions, TimeScale } from 'chart.js';

import { chartNamesType } from '~/core/types/stat/chartNameType';
import * as moment from 'moment';

const commonOptions: ChartOptions = {
  scales: {
    xAxes: [
      {
        type: 'time',
        stacked: true,
        gridLines: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          fontStyle: 'bold',
          fontSize: 14,
          fontColor: '#454545',
        },
        offset: true,
      },
    ],
    yAxes: [
      {
        gridLines: {
          display: false,
          drawBorder: false,
        },
        stacked: false,
        ticks: {
          display: false,
          autoSkip: false,
        },
      },
    ],
  },
  legend: {
    display: false,
  },
};

const monthOptionsTime: TimeScale = {
  unit: 'month',
  tooltipFormat: 'MMMM',
};

const dayOptionsTime: TimeScale = {
  unit: 'day',
  tooltipFormat: 'D MMM',
  displayFormats: {
    day: 'D MMM',
  },
};

export const statChartOptions: chartNamesType & { [key: string]: ChartOptions } = {
  tripsPerMonth: {
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
        label(tooltipItem, data) {
          return ` ${tooltipItem.yLabel} trajets`;
        },
      },
    },
  },
  tripsPerDay: {
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
        label(tooltipItem, data) {
          return ` ${tooltipItem.yLabel} trajets`;
        },
      },
    },
  },
  tripsPerDayCumulated: {
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
        label(tooltipItem, data) {
          return ` ${tooltipItem.yLabel} trajets`;
        },
      },
    },
  },
  tripsSubsidizedPerDay: {
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
        label(tooltipItem, data) {
          return ` ${tooltipItem.yLabel} trajets`;
        },
      },
    },
  },
  tripsSubsidizedPerMonth: {
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
        label(tooltipItem, data) {
          return ` ${tooltipItem.yLabel} trajets`;
        },
      },
    },
  },
  tripsSubsidizedPerDayCumulated: {
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
        label(tooltipItem, data) {
          return ` ${tooltipItem.yLabel} trajets`;
        },
      },
    },
  },
  distancePerDay: {
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
        label(tooltipItem, data) {
          return ` ${tooltipItem.yLabel} km`;
        },
      },
    },
  },
  distancePerMonth: {
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
        label(tooltipItem, data) {
          return ` ${tooltipItem.yLabel} km`;
        },
      },
    },
  },
  distancePerDayCumulated: {
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
        label(tooltipItem, data) {
          return ` ${tooltipItem.yLabel} km`;
        },
      },
    },
  },
  carpoolersPerMonth: {
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
        label(tooltipItem, data) {
          return ` ${tooltipItem.yLabel} covoitureurs`;
        },
      },
    },
  },
  carpoolersPerDayCumulated: {
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
        label(tooltipItem, data) {
          return ` ${tooltipItem.yLabel} covoitureurs`;
        },
      },
    },
  },
  petrolPerMonth: {
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
        label(tooltipItem, data) {
          return ` ${tooltipItem.yLabel} litres`;
        },
      },
    },
  },
  petrolPerDayCumulated: {
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
        label(tooltipItem, data) {
          return ` ${tooltipItem.yLabel} litres`;
        },
      },
    },
  },
  co2PerMonth: {
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
        label(tooltipItem, data) {
          return ` ${tooltipItem.yLabel} kg`;
        },
      },
    },
  },
  co2PerDayCumulated: {
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
        label(tooltipItem, data) {
          return ` ${tooltipItem.yLabel} kg`;
        },
      },
    },
  },
  carpoolersPerVehiculePerDay: {
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
        label(tooltipItem, data) {
          return ` ${tooltipItem.yLabel} personnes`;
        },
      },
    },
  },
  carpoolersPerVehiculePerMonth: {
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
        label(tooltipItem, data) {
          return ` ${tooltipItem.yLabel} personnes`;
        },
      },
    },
  },
};
