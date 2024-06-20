import { INSEECode, IndicType, PerimeterLabel, PerimeterType } from '../../geo/shared/Perimeter.ts';

export interface SingleResultInterface {
  territory: PerimeterType;
  l_territory: PerimeterLabel;
  journeys?: number;
  passengers?: number;
  has_incentive?: number;
  distance?: number;
  duration?: number;
}

export type ResultInterface = SingleResultInterface[];

export interface ParamsInterface {
  year: number;
  month: number;
  type: PerimeterType; //type de territoire selectionné
  code: INSEECode; //code insee du territoire observé
  indic: IndicType;
  past?: string;
}

export const handlerConfig = {
  service: 'observatory',
  method: 'evolMonthlyFlux',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
