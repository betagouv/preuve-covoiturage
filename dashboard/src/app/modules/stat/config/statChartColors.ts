import { ChartDataSets } from 'chart.js';

import { chartNamesType } from '~/core/types/stat/chartNameType';

const secondaryColor = '#65C8CF';
const primaryColor = '#007AD9';

export const statChartColors: chartNamesType & { [key: string]: ChartDataSets } = {
  tripsPerMonth: {
    backgroundColor: secondaryColor,
    hoverBackgroundColor: secondaryColor,
    borderColor: secondaryColor,
  },
  tripsPerDay: {
    backgroundColor: secondaryColor,
    hoverBackgroundColor: secondaryColor,
    borderColor: secondaryColor,
  },
  tripsPerDayCumulated: {
    backgroundColor: secondaryColor,
    hoverBackgroundColor: secondaryColor,
    borderColor: secondaryColor,
  },
  tripsSubsidizedPerDay: {
    backgroundColor: primaryColor,
    hoverBackgroundColor: primaryColor,
    borderColor: primaryColor,
  },
  tripsSubsidizedPerMonth: {
    backgroundColor: primaryColor,
    hoverBackgroundColor: primaryColor,
    borderColor: primaryColor,
  },
  tripsSubsidizedPerDayCumulated: {
    backgroundColor: primaryColor,
    hoverBackgroundColor: primaryColor,
    borderColor: primaryColor,
  },
  distancePerDay: {
    backgroundColor: secondaryColor,
    hoverBackgroundColor: secondaryColor,
    borderColor: secondaryColor,
  },
  distancePerMonth: {
    backgroundColor: secondaryColor,
    hoverBackgroundColor: secondaryColor,
    borderColor: secondaryColor,
  },
  distancePerDayCumulated: {
    backgroundColor: secondaryColor,
    hoverBackgroundColor: secondaryColor,
    borderColor: secondaryColor,
  },
  carpoolersPerMonth: {
    backgroundColor: secondaryColor,
    hoverBackgroundColor: secondaryColor,
    borderColor: secondaryColor,
  },
  carpoolersPerDayCumulated: {
    backgroundColor: secondaryColor,
    hoverBackgroundColor: secondaryColor,
    borderColor: secondaryColor,
  },
  petrolPerMonth: {
    backgroundColor: secondaryColor,
    hoverBackgroundColor: secondaryColor,
    borderColor: secondaryColor,
  },
  petrolPerDayCumulated: {
    backgroundColor: secondaryColor,
    hoverBackgroundColor: secondaryColor,
    borderColor: secondaryColor,
  },
  co2PerMonth: {
    backgroundColor: secondaryColor,
    hoverBackgroundColor: secondaryColor,
    borderColor: secondaryColor,
  },
  co2PerDayCumulated: {
    backgroundColor: secondaryColor,
    hoverBackgroundColor: secondaryColor,
    borderColor: secondaryColor,
  },
  carpoolersPerVehiculePerDay: {
    backgroundColor: secondaryColor,
    hoverBackgroundColor: secondaryColor,
    borderColor: secondaryColor,
  },
  carpoolersPerVehiculePerMonth: {
    backgroundColor: secondaryColor,
    hoverBackgroundColor: secondaryColor,
    borderColor: secondaryColor,
  },
};
