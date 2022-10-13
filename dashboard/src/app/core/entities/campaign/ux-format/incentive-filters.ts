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

export interface IncentiveTimeRuleUxInterface {
  start: string;
  end: string;
}

export interface IncentiveTimeRuleInterface {
  start: number;
  end: number;
  tz: string;
}
