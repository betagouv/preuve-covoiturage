import { provider } from "@/ilos/common/index.ts";

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
} from "./interfaces/index.ts";

import { errorCode, taggedLogger } from "@/lib/logger/tagged.ts";
import {
  EtalabAPIGeoProvider,
  EtalabBaseAdresseNationaleProvider,
  LocalGeoProvider,
  OSRMProvider,
} from "./providers/index.ts";

const log = taggedLogger("[geo]");

@provider({
  identifier: GeoProviderInterfaceResolver,
})
export class GeoProvider implements GeoProviderInterface {
  protected geoCoderProviders: GeoCoderInterface[] = [];
  protected inseeCoderProviders: InseeCoderInterface[] = [];
  protected inseeReverseCoderProviders: InseeReverseCoderInterface[] = [];
  protected routeMetaProviders: RouteMetaProviderInterface[] = [];

  constructor(
    etalabAPIGeoProvider: EtalabAPIGeoProvider,
    etalabBANProvider: EtalabBaseAdresseNationaleProvider,
    localGeoProvider: LocalGeoProvider,
    osrmProvider: OSRMProvider,
  ) {
    // Geocoders => litteral to point
    this.geoCoderProviders = [etalabBANProvider];

    // InseeCoders => point to insee
    this.inseeCoderProviders = [
      localGeoProvider,
      etalabAPIGeoProvider,
      etalabBANProvider,
    ];

    // InseeReverseCoders => insee to point
    this.inseeReverseCoderProviders = [etalabAPIGeoProvider];

    // RouteMetaCoders => point,point to distance,duration
    this.routeMetaProviders = [osrmProvider];
  }

  async literalToPosition(literal: string): Promise<PointInterface> {
    const failure = [];
    for (const geocoder of this.geoCoderProviders) {
      try {
        return await geocoder.literalToPosition(literal);
      } catch (e) {
        log.error("literal to position", { error: errorCode(e) });
        failure.push(`literalToPosition ${e.message}`);
      }
    }
    throw new Error(failure.join(", "));
  }

  async inseeToPosition(insee: string): Promise<PointInterface> {
    const failure = [];
    for (const inseeReverseCoder of this.inseeReverseCoderProviders) {
      try {
        return await inseeReverseCoder.inseeToPosition(insee);
      } catch (e) {
        log.error("insee to position", { insee, error: errorCode(e) });
        failure.push(`inseeToPosition ${e.message}`);
      }
    }

    throw new Error(failure.join(", "));
  }

  async positionToInsee(geo: PointInterface): Promise<string> {
    const failure = [];
    for (const inseecoder of this.inseeCoderProviders) {
      try {
        return await inseecoder.positionToInsee(geo);
      } catch (e) {
        log.error("position to insee", { lon: geo.lon, lat: geo.lat, error: errorCode(e) });
        failure.push(`positionToInsee ${e.message}`);
      }
    }
    throw new Error(failure.join(", "));
  }

  async getRouteMeta(
    start: PointInterface,
    end: PointInterface,
  ): Promise<RouteMeta> {
    const failure = [];
    for (const routeMeta of this.routeMetaProviders) {
      try {
        return await routeMeta.getRouteMeta(start, end);
      } catch (e) {
        log.error("route meta", {
          start_lon: start.lon,
          start_lat: start.lat,
          end_lon: end.lon,
          end_lat: end.lat,
          error: errorCode(e),
        });
        failure.push(`getRouteMeta ${e.message}`);
      }
    }
    throw new Error(failure.join(", "));
  }

  async checkAndComplete(data: PartialGeoInterface): Promise<GeoInterface> {
    const { literal } = data;
    let { lat, lon, geo_code } = data;

    if ((!lat || !lon) && !literal && !geo_code) {
      throw new Error("Missing point param (lat/lon or literal or insee)");
    }

    if (!lat || !lon) {
      if (literal) {
        ({ lat, lon } = await this.literalToPosition(literal));
      } else if (geo_code) {
        ({ lat, lon } = await this.inseeToPosition(geo_code));
      }
    }

    if (!geo_code && (lat && lon)) {
      geo_code = await this.positionToInsee({ lat, lon });
    }

    return {
      lat: lat || 0,
      lon: lon || 0,
      geo_code: geo_code || "",
    };
  }
}
