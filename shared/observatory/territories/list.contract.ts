import { PerimeterLabel, PerimeterType } from '../../geo/shared/Perimeter';

export interface SingleResultInterface {
  territory: PerimeterType;
  l_territory: PerimeterLabel;
  type: PerimeterType;
}

export type ResultInterface = SingleResultInterface[];

export interface ParamsInterface {
  year: number;
}

export const handlerConfig = {
  service: 'observatory',
  method: 'territoriesList',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
