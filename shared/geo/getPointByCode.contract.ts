import { Point } from './shared/Point';

export interface ParamsInterface {
  code: string;
}

export type ResultInterface = Point;

export const handlerConfig = {
  service: 'geo',
  method: 'getPointByCode',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
