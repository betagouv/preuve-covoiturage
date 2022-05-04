import { SingleResultInterface as GeoInterface } from './listGeo.contract';
export interface ParamsInterface {
  insees: string[];
}

export type ResultInterface = Array<GeoInterface>;

export const handlerConfig = {
  service: 'territory',
  method: 'findGeoByCode',
};
export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
