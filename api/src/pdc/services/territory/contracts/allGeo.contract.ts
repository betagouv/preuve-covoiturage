import { PerimeterCode, PerimeterLabel, PerimeterType } from '../geo/shared/Perimeter.ts';

export interface SingleResultInterface {
  id: string;
  territory: PerimeterCode;
  l_territory: PerimeterLabel;
  type: PerimeterType;
}

export type ResultInterface = SingleResultInterface[];

export const handlerConfig = {
  service: 'territory',
  method: 'allGeo',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
