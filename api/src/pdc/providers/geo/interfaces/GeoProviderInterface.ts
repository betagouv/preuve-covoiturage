import { GeoInterface, PartialGeoInterface } from './GeoInterface.ts';
import { GeoCoderInterface } from './GeoCoderInterface.ts';
import { InseeCoderInterface } from './InseeCoderInterface.ts';
import { RouteMetaProviderInterface, RouteMeta } from './RouteMetaProviderInterface.ts';
import { PointInterface } from './PointInterface.ts';
import { InseeReverseCoderInterface } from './InseeReverseCoderInterface.ts';

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
