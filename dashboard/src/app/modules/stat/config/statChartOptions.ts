import { ChartOptions, TimeScale } from 'chart.js';

export const commonOptions: ChartOptions = {
  scales: {
    xAxes: [
      {
        // type: 'time',
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

export const monthOptionsTime: TimeScale = {
  unit: 'month',
  tooltipFormat: 'MMMM',
};

export const dayOptionsTime: TimeScale = {
  unit: 'day',
  tooltipFormat: 'D MMM',
  displayFormats: {
    day: 'D MMM',
  },
};
