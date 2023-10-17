import { provider } from '@ilos/common';

import {
  GeoCoderInterface,
  GeoInterface,
  GeoProviderInterface,
  GeoProviderInterfaceResolver,
  InseeCoderInterface,
  InseeReverseCoderInterface,
  PartialGeoInterface,
  PointInterface,
  RouteMeta,
  RouteMetaProviderInterface,
} from './interfaces';

import { EtalabGeoAdministriveProvider, EtalabGeoAdressProvider, LocalGeoProvider, OSRMProvider } from './providers';

@provider({
  identifier: GeoProviderInterfaceResolver,
})
export class GeoProvider implements GeoProviderInterface {
  protected geoCoderProviders: GeoCoderInterface[] = [];
  protected inseeCoderProviders: InseeCoderInterface[] = [];
  protected inseeReverseCoderProviders: InseeReverseCoderInterface[] = [];
  protected routeMetaProviders: RouteMetaProviderInterface[] = [];

  constructor(
    etalabGeoAdministriveProvider: EtalabGeoAdministriveProvider,
    etalabGeoAdressProvider: EtalabGeoAdressProvider,
    localGeoProvider: LocalGeoProvider,
    osrmProvider: OSRMProvider,
  ) {
    // Geocoders => litteral to point
    this.geoCoderProviders = [etalabGeoAdressProvider];

    // InseeCoders => point to insee
    this.inseeCoderProviders = [localGeoProvider, etalabGeoAdministriveProvider, etalabGeoAdressProvider];

    // InseeReverseCoders => insee to point
    this.inseeReverseCoderProviders = [etalabGeoAdministriveProvider];

    // RouteMetaCoders => point,point to distance,duration
    this.routeMetaProviders = [osrmProvider];
  }

  async literalToPosition(literal: string): Promise<PointInterface> {
    const failure = [];
    for (const geocoder of this.geoCoderProviders) {
      try {
        return await geocoder.literalToPosition(literal);
      } catch (e) {
        failure.push(`literalToPosition ${e.message}`);
      }
    }
    throw new Error(failure.join(', '));
  }

  async inseeToPosition(insee: string): Promise<PointInterface> {
    const failure = [];
    for (const inseeReverseCoder of this.inseeReverseCoderProviders) {
      try {
        return await inseeReverseCoder.inseeToPosition(insee);
      } catch (e) {
        failure.push(`inseeToPosition ${e.message}`);
      }
    }

    throw new Error(failure.join(', '));
  }

  async positionToInsee(geo: PointInterface): Promise<string> {
    const failure = [];
    for (const inseecoder of this.inseeCoderProviders) {
      try {
        return await inseecoder.positionToInsee(geo);
      } catch (e) {
        failure.push(`positionToInsee ${e.message}`);
      }
    }
    throw new Error(failure.join(', '));
  }

  async getRouteMeta(start: PointInterface, end: PointInterface): Promise<RouteMeta> {
    const failure = [];
    for (const routeMeta of this.routeMetaProviders) {
      try {
        return await routeMeta.getRouteMeta(start, end);
      } catch (e) {
        failure.push(`getRouteMeta ${e.message}`);
      }
    }
    throw new Error(failure.join(', '));
  }

  async checkAndComplete(data: PartialGeoInterface): Promise<GeoInterface> {
    const { literal } = data;
    let { lat, lon, geo_code } = data;

    if ((!lat || !lon) && !literal && !geo_code) {
      throw new Error('Missing point param (lat/lon or literal or insee)');
    }

    if (!lat || !lon) {
      if (literal) {
        ({ lat, lon } = await this.literalToPosition(literal));
      } else {
        ({ lat, lon } = await this.inseeToPosition(geo_code));
      }
    }

    if (!geo_code) {
      geo_code = await this.positionToInsee({ lat, lon });
    }

    return {
      lat,
      lon,
      geo_code,
    };
  }
}
