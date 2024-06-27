import { PointInterface } from "./PointInterface.ts";

export interface RouteMeta {
  distance: number;
  duration: number;
}

export interface RouteMetaProviderInterface {
  getRouteMeta(start: PointInterface, end: PointInterface): Promise<RouteMeta>;
}
