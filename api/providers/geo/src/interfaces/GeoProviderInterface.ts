import { GeoInterface, PartialGeoInterface } from './GeoInterface';
import { GeoCoderInterface } from './GeoCoderInterface';
import { InseeCoderInterface } from './InseeCoderInterface';
import { RouteMetaProviderInterface, RouteMeta } from './RouteMetaProviderInterface';
import { PointInterface } from './PointInterface';
import { InseeReverseCoderInterface } from './InseeReverseCoderInterface';

export interface GeoProviderInterface extends GeoCoderInterface, InseeCoderInterface, RouteMetaProviderInterface, InseeReverseCoderInterface {
  checkAndComplete(data: PartialGeoInterface):Promise<GeoInterface>;
}

export abstract class GeoProviderInterfaceResolver implements GeoProviderInterface {
  inseeToPosition(insee: string): Promise<PointInterface> {
    throw new Error();
  }

  literalToPosition(literal: string): Promise<PointInterface> {
    throw new Error();
  }

  positionToInsee(geo: PointInterface): Promise<string> {
    throw new Error();
  }

  getRouteMeta(start: PointInterface, end: PointInterface): Promise<RouteMeta> {
    throw new Error();
  }

  checkAndComplete(data: PartialGeoInterface):Promise<GeoInterface> {
    throw new Error();
  }
}
