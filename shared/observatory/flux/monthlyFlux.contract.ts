import { INSEECode, PerimeterType } from '../../geo/shared/Perimeter.ts';

export interface SingleResultInterface {
  ter_1: string;
  lng_1: number;
  lat_1: number;
  ter_2: string;
  lng_2: number;
  lat_2: number;
  passengers: number;
  distance: number;
  duration: number;
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
  method: 'monthlyFlux',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
