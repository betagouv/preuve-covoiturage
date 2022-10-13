// tslint:disable:variable-name

export interface IncentiveInseeFilterInterface {
  start: InseeAndTerritoryInterface[];
  end: InseeAndTerritoryInterface[];
}

export interface InseeAndTerritoryInterface {
  territory_literal: string;
  insees: string;
  context: string;
}
