export interface SingleResultInterface {
  territory: string;
  l_territory: string;
  passengers: number;
  distance: number;
  duration: number;
  journeys: number;
  intra_journeys: number;
  trips: number;
  has_incentive: number;
  occupation_rate: number;
}

export type ResultInterface = SingleResultInterface[];

export interface ParamsInterface {
  year: number;
  month: number;
  type: string; //type de territoire selectionné
  code: string; //code insee du territoire
}

export const handlerConfig = {
  service: 'observatory',
  method: 'monthlyKeyfigures',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
