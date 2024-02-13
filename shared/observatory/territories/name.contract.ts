import { PerimeterLabel, PerimeterType } from '../../geo/shared/Perimeter';

export interface ResultInterface {
  territory: PerimeterType;
  l_territory: PerimeterLabel;
  type: PerimeterType;
}

export interface ParamsInterface {
  year: number;
  code: string;
  type: PerimeterType;
}

export const handlerConfig = {
  service: 'observatory',
  method: 'territoryName',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
