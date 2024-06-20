import { PerimeterLabel, PerimeterType, PerimeterCode } from '../../geo/shared/Perimeter.ts';

export interface SingleResultInterface {
  territory: PerimeterCode;
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

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
