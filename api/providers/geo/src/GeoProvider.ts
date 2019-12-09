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
  LocalOSRMProvider,
  OSMNominatimProvider,
  OSRMProvider,
  PhotonProvider,
} from './providers';

@provider({
  identifier: GeoProviderInterfaceResolver,
})
export class GeoProvider implements GeoProviderInterface {
  protected geoCoderProviders: GeoCoderInterface[] = [
    new EtalabGeoAdressProvider(),
    new PhotonProvider(),
    new OSMNominatimProvider(),
  ];

  protected inseeCoderProviders: InseeCoderInterface[] = [
    new EtalabGeoAdministriveProvider(),
    new EtalabGeoAdressProvider(),
  ];

  protected inseeReverseCoderProviders: InseeReverseCoderInterface[] = [new EtalabGeoAdministriveProvider()];

  protected routeMetaProviders: RouteMetaProviderInterface[] = [new LocalOSRMProvider(), new OSRMProvider()];

  constructor() {}

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
