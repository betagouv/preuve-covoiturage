import { PositionInterface } from '../common/interfaces/PositionInterface';

export interface PartialGeoInterface {
  lat: number;
  lon: number;
  insee: string;
  literal?: string;
}

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
  start: PositionInterface;
  end: PositionInterface;
}

export const handlerConfig = {
  service: 'normalization',
  method: 'geo',
};
export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
