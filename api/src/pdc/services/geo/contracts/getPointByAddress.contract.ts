import { Point } from './shared/Point.ts';

export interface ParamsInterface {
  litteral: string;
  country: string;
}

export type ResultInterface = Point;

export const handlerConfig = {
  service: 'geo',
  method: 'getPointByAddress',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
