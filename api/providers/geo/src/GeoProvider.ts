import { provider } from '@ilos/common';

import {
  GeoCoderInterface,
  GeoInterface,
  GeoProviderInterface,
  GeoProviderInterfaceResolver,
  InseeCoderInterface,
  PartialGeoInterface,
  PointInterface,
  RouteMeta,
  RouteMetaProviderInterface,
  InseeReverseCoderInterface,
} from './interfaces';

import {
  EtalabGeoAdministriveProvider,
  EtalabGeoAdressProvider,
  LocalGeoProvider,
  LocalOSRMProvider,
  OSMNominatimProvider,
  OSRMProvider,
  PhotonProvider,
} from './providers';

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
    localOsrmProvider: LocalOSRMProvider,
    localGeoProvider: LocalGeoProvider,
    osmnominatimProvider: OSMNominatimProvider,
    osrmProvider: OSRMProvider,
    photonProvider: PhotonProvider,
  ) {
    // Geocoders => litteral to point
    this.geoCoderProviders = [etalabGeoAdressProvider, photonProvider, osmnominatimProvider];

    // InseeCoders => point to insee
    this.inseeCoderProviders = [localGeoProvider, etalabGeoAdministriveProvider, etalabGeoAdressProvider];

    // InseeReverseCoders => insee to point
    this.inseeReverseCoderProviders = [etalabGeoAdministriveProvider];

    // RouteMetaCoders => point,point to distance,duration
    this.routeMetaProviders = [localOsrmProvider, osrmProvider];
  }

  async literalToPosition(literal: string): Promise<PointInterface> {
    const failure = [];
    for (const geocoder of this.geoCoderProviders) {
      try {
        return geocoder.literalToPosition(literal);
      } catch (e) {
        failure.push(e.message);
      }
    }
    throw new Error(failure.join(', '));
  }

  async inseeToPosition(insee: string): Promise<PointInterface> {
    const failure = [];
    for (const inseeReverseCoder of this.inseeReverseCoderProviders) {
      try {
        return inseeReverseCoder.inseeToPosition(insee);
      } catch (e) {
        failure.push(e.message);
      }
    }
    throw new Error(failure.join(', '));
  }

  async positionToInsee(geo: PointInterface): Promise<string> {
    const failure = [];
    for (const inseecoder of this.inseeCoderProviders) {
      try {
        return inseecoder.positionToInsee(geo);
      } catch (e) {
        failure.push(e.message);
      }
    }
    throw new Error(failure.join(', '));
  }

  async getRouteMeta(start: PointInterface, end: PointInterface): Promise<RouteMeta> {
    const failure = [];
    for (const routeMeta of this.routeMetaProviders) {
      try {
        return routeMeta.getRouteMeta(start, end);
      } catch (e) {
        failure.push(e.message);
      }
    }
    throw new Error(failure.join(', '));
  }

  async checkAndComplete(data: PartialGeoInterface): Promise<GeoInterface> {
    const { literal } = data;
    let { lat, lon, insee } = data;

    if ((!lat || !lon) && !literal && !insee) {
      throw new Error('Missing point param (lat/lon or literal or insee)');
    }

    if (!lat || !lon) {
      if (literal) {
        ({ lat, lon } = await this.literalToPosition(literal));
      } else {
        ({ lat, lon } = await this.inseeToPosition(insee));
      }
    }

    if (!insee) {
      insee = await this.positionToInsee({ lat, lon });
    }

    return {
      lat,
      lon,
      insee,
    };
  }
}
