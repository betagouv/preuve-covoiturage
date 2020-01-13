import { PartialGeoInterface } from '@pdc/provider-geo/dist/interfaces';

export type ResultInterface = {
  start: {
    lat: number;
    lon: number;
    insee: string;
  };
  end: {
    lat: number;
    lon: number;
    insee: string;
  };
};
export interface ParamsInterface {
  start: PartialGeoInterface;
  end: PartialGeoInterface;
}

export const handlerConfig = {
  service: 'normalization',
  method: 'geo',
};
export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
