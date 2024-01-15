import { INSEECode, PerimeterLabel, PerimeterType } from '../../geo/shared/Perimeter';

export interface SingleResultInterface {
  territory_1: PerimeterType;
  l_territory_1: PerimeterLabel;
  territory_2: PerimeterType;
  l_territory_2: PerimeterLabel;
  journeys: number;
}

export type ResultInterface = SingleResultInterface[];

export interface ParamsInterface {
  year: number;
  month: number;
  type: PerimeterType; //type de territoire selectionné
  code: INSEECode; //code insee du territoire observé
  limit?: number; //Nb de résultats
}

export const handlerConfig = {
  service: 'observatory',
  method: 'bestMonthlyFlux',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
