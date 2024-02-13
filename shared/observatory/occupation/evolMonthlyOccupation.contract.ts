import { INSEECode, IndicType, PerimeterLabel, PerimeterType } from '../../geo/shared/Perimeter';

export interface SingleResultInterface {
  territory: PerimeterType;
  l_territory: PerimeterLabel;
  journeys?: number;
  trips?: number;
  has_incentive?: number;
  occupation_rate?: number;
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
  method: 'evolMonthlyOccupation',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
