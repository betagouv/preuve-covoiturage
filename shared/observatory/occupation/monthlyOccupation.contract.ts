import type { Feature } from 'geojson';
import { INSEECode, PerimeterLabel, PerimeterType } from '../../geo/shared/Perimeter.ts';

export interface SingleResultInterface {
  territory: PerimeterType;
  l_territory: PerimeterLabel;
  journeys: number;
  has_incentive: number;
  occupation_rate: number;
  geom: Feature;
}

export type ResultInterface = SingleResultInterface[];

export interface ParamsInterface {
  year: number;
  month: number;
  type: PerimeterType; //type de territoire selectionné
  code: INSEECode; //code insee du territoire selectionné
  observe: PerimeterType; //type du territoire observé
}

export const handlerConfig = {
  service: 'observatory',
  method: 'monthlyOccupation',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
