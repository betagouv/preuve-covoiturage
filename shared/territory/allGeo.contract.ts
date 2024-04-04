import { PerimeterLabel, PerimeterType, PerimeterCode } from '@shared/geo/shared/Perimeter';

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
