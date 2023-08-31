import { Direction, INSEECode, PerimeterLabel, PerimeterType } from '../../geo/shared/Perimeter';

export interface SingleResultInterface {
  territory: PerimeterType;
  l_territory: PerimeterLabel;
  direction: Direction;
  distances: {
    dist_classes: string;
    journeys: number;
  }[];
}

export type ResultInterface = SingleResultInterface[];

export interface ParamsInterface {
  year: number;
  month: number;
  type: PerimeterType; //type de territoire selectionné
  code: INSEECode; //code insee du territoire observé
  direction?: Direction;
}

export const handlerConfig = {
  service: 'observatory',
  method: 'journeysByDistances',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
