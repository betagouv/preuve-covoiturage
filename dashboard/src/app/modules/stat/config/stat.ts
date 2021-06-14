import { StatInterface } from '~/core/interfaces/stat/StatInterface';
import { StatNavName } from '~/core/types/stat/statDataNameType';

export const petrolFactor = 0.0000636 * 1000; // liters par km
export const co2Factor = 0.000195 * 1000; // kg per km

export const ALL_STATS = ['trips', 'distance', 'co2', 'petrol', 'carpoolers', 'carpoolersPerVehicule'] as StatNavName[];

export const statFormater: { [key: string]: (data: StatInterface) => number | string } = {
  [StatNavName.Trips]: (data) => data.trip,
  [StatNavName.Petrol]: (data) => data.distance * petrolFactor,
  [StatNavName.Operators]: (data) => data.operators,
  [StatNavName.Distance]: (data) => data.distance,
  [StatNavName.CarpoolersPerVehicule]: (data) => data.average_carpoolers_by_car,
  [StatNavName.CarPoolers]: (data) => data.carpoolers,
  [StatNavName.CO2]: (data) => data.distance * co2Factor,
};

export const TERRITORY_STATS = [
  'trips',
  'distance',
  'carpoolers',
  'petrol',
  'co2',
  'carpoolersPerVehicule',
] as StatNavName[];

export const OPERATOR_STATS = [
  'trips',
  'distance',
  'carpoolers',
  'petrol',
  'co2',
  'carpoolersPerVehicule',
] as StatNavName[];

export const PUBLIC_STATS = [
  'trips',
  'distance',
  'co2',
  'petrol',
  'carpoolers',
  'carpoolersPerVehicule',
] as StatNavName[];
