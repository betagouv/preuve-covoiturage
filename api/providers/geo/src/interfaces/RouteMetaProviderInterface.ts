import { PointInterface } from './PointInterface';

export interface RouteMeta {
  distance: number;
  duration: number;
}

export interface RouteMetaProviderInterface {
  getRouteMeta(start: PointInterface, end: PointInterface): Promise<RouteMeta>;
}
