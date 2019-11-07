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

  protected routeMetaProviders: RouteMetaProviderInterface[] = [
    new LocalOSRMProvider(),
    new OSRMProvider(),
  ];

  constructor() {}

  async toPosition(literal: string): Promise<PointInterface> {
    const failure = [];
    for(const geocoder of this.geoCoderProviders) {
      try {
        const result = await geocoder.toPosition(literal);
        return result;
      } catch(e) {
        //
        failure.push(e.message);
      }
    }
    throw new Error(failure.join(', '));
  }

  async toInsee(geo: PointInterface): Promise<string> {
    const failure = [];
    for(const inseecoder of this.inseeCoderProviders) {
      try {
        const result = await inseecoder.toInsee(geo);
        return result;
      } catch(e) {
        //
        failure.push(e.message);
      }
    }
    throw new Error(failure.join(', '));
  }

  async getRouteMeta(start: PointInterface, end: PointInterface): Promise<RouteMeta> {
    const failure = [];
    for(const routeMeta of this.routeMetaProviders) {
      try {
        const result = await routeMeta.getRouteMeta(start, end);
        return result;
      } catch(e) {
        //
        failure.push(e.message);
      }
    }
    throw new Error(failure.join(', '));
  }

  async checkAndComplete(data: PartialGeoInterface):Promise<GeoInterface> {
    let { lat, lon, literal, insee } = data;

    if (!lat || ! lon) {
      if(!literal) {
        throw new Error('Missing point param (lat/lon or literal)');
      }
      ({ lat, lon } = await this.toPosition(data.literal));
    }

    if (!insee) {
      insee = await this.toInsee({ lat, lon });
    }

    return {
      lat,
      lon,
      insee,
    };
  }
}
