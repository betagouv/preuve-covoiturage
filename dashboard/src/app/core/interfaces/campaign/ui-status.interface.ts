export interface UiStatusInterface {
  for_driver: boolean;
  for_passenger: boolean;
  for_trip: boolean;
  staggered: boolean;
  insee_filter?: {
    blackList: UiStatusInseeFilterInterface[];
    whiteList: UiStatusInseeFilterInterface[];
  };
}

export interface UiStatusInseeFilterInterface {
  start: UiStatusInseeAndTerritoryInterface;
  end: UiStatusInseeAndTerritoryInterface;
  operator: InseeFilterOperatorEnum;
}

export interface UiStatusInseeAndTerritoryInterface {
  territory_literal: string;
  insees: string[];
}

export enum InseeFilterOperatorEnum {
  AND = 'and',
  OR = 'or',
}
