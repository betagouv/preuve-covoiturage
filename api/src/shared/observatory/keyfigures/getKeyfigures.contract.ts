import { INSEECode, PerimeterLabel, PerimeterType } from '../../geo/shared/Perimeter.ts';

export interface SingleResultInterface {
  territory: PerimeterType;
  l_territory: PerimeterLabel;
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
  month?: number;
  trimester?: number;
  semester?: number;
  type: PerimeterType; //type de territoire selectionné
  code: INSEECode; //code insee du territoire
}

export const handlerConfig = {
  service: 'observatory',
  method: 'getKeyfigures',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
