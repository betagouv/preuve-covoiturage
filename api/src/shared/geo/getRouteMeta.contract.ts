import { Point } from './shared/Point.ts';

export interface ParamsInterface {
  start: Point;
  end: Point;
}

export interface ResultInterface {
  distance: number;
  duration: number;
}

export const handlerConfig = {
  service: 'geo',
  method: 'getRouteMeta',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
