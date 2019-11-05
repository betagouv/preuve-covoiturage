import { IncentiveInseeFilterInterface } from '~/core/entities/campaign/ux-format/incentive-filters';

export interface UiStatusInterface {
  for_driver: boolean;
  for_passenger: boolean;
  for_trip: boolean;
  staggered: boolean;
  insee_filter?: UiStatusInseeFilterInterface;
}

export interface UiStatusInseeFilterInterface {
  blackList: IncentiveInseeFilterInterface[];
  whiteList: IncentiveInseeFilterInterface[];
}

// export interface UiStatusInseeFilterInterface {
//   start: UiStatusInseeAndTerritoryInterface[];
//   end: UiStatusInseeAndTerritoryInterface[];
// }
//
// export interface UiStatusInseeAndTerritoryInterface {
//   territory_literal: string;
//   insees: string[];
// }
//
// export enum InseeFilterOperatorEnum {
//   AND = 'and',
//   OR = 'or',
// }
