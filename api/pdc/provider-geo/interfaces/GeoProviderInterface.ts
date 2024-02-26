import { GeoInterface, PartialGeoInterface } from './GeoInterface';
import { GeoCoderInterface } from './GeoCoderInterface';
import { InseeCoderInterface } from './InseeCoderInterface';
import { RouteMetaProviderInterface, RouteMeta } from './RouteMetaProviderInterface';
import { PointInterface } from './PointInterface';
import { InseeReverseCoderInterface } from './InseeReverseCoderInterface';

export interface GeoProviderInterface
  extends GeoCoderInterface,
    InseeCoderInterface,
    RouteMetaProviderInterface,
    InseeReverseCoderInterface {
  checkAndComplete(data: PartialGeoInterface): Promise<GeoInterface>;
}

export abstract class GeoProviderInterfaceResolver implements GeoProviderInterface {
  async inseeToPosition(insee: string): Promise<PointInterface> {
    throw new Error();
  }

  async literalToPosition(literal: string): Promise<PointInterface> {
    throw new Error();
  }

  async positionToInsee(geo: PointInterface): Promise<string> {
    throw new Error();
  }

  async getRouteMeta(start: PointInterface, end: PointInterface): Promise<RouteMeta> {
    throw new Error();
  }

  async checkAndComplete(data: PartialGeoInterface): Promise<GeoInterface> {
    throw new Error();
  }
}
