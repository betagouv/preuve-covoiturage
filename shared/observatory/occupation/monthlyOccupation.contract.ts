import { Feature } from 'geojson';

export interface SingleResultInterface {
  territory: string;
  l_territory: string;
  journeys: number;
  has_incentive: number;
  occupation_rate: number;
  geom: Feature;
}

export type ResultInterface = SingleResultInterface[];

export interface ParamsInterface {
  year: number;
  month: number;
  type: string; //type de territoire selectionné
  code?: string; //code insee du territoire observé
  observe?: string; //type du territoire observé
}

export const handlerConfig = {
  service: 'observatory',
  method: 'monthlyOccupation',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
