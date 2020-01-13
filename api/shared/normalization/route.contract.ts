import { AcquisitionInterface } from '../acquisition/common/interfaces/AcquisitionInterface';

export type ResultInterface = {
  calc_distance: number;
  calc_duration: number;
};
export interface ParamsInterface {
  start: {
    lat: number;
    lon: number;
  };
  end: {
    lat: number;
    lon: number;
  };
}

export const handlerConfig = {
  service: 'normalization',
  method: 'route',
};
export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
