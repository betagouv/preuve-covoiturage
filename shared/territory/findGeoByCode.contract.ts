import { TerritorySelectorsInterface } from './common/interfaces/TerritoryCodeInterface';
import { SingleResultInterface as GeoSingleResultInterface } from './findGeoByName.contract';

export type ResultInterface = GeoSingleResultInterface[];

export const handlerConfig = {
  service: 'territory',
  method: 'findGeoByCode',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

export type ParamsInterface = TerritorySelectorsInterface;
