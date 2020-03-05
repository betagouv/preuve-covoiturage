import { statDataNameType } from '~/core/types/stat/statDataNameType';

export const petrolFactor = 0.0000636 * 1000; // liters par km
export const co2Factor = 0.000195 * 1000; // kg per km

export const TERRITORY_STATS = {
  // todo: add 'operators' when ready
  names: <statDataNameType[]>['trips', 'distance', 'carpoolers', 'petrol', 'co2', 'carpoolersPerVehicule'],
  defaultGraphName: 'trips' as statDataNameType,
};

export const OPERATOR_STATS = {
  names: <statDataNameType[]>['trips', 'distance', 'carpoolers', 'petrol', 'co2', 'carpoolersPerVehicule'],
  defaultGraphName: 'trips' as statDataNameType,
};

export const PUBLIC_STATS = {
  names: ['trips', 'distance', 'co2', 'petrol', 'carpoolers', 'carpoolersPerVehicule'] as statDataNameType[],
};
