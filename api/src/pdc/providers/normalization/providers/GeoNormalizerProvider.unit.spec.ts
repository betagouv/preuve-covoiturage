import { assert, assertEquals, it } from "@/dev_deps.ts";
import { GeoProviderInterfaceResolver } from "@/pdc/providers/geo/index.ts";
import { GeoInterface, PartialGeoInterface } from "../interfaces/index.ts";
import { GeoNormalizerProvider } from "./GeoNormalizerProvider.ts";

class GeoProvider extends GeoProviderInterfaceResolver {
  async checkAndComplete(data: PartialGeoInterface): Promise<GeoInterface> {
    const lat = data.lat || 0;
    const lon = data.lon || 0;
    return {
      lat,
      lon,
      geo_code: `${lat.toString(10)}_${lon.toString(10)}`,
    };
  }
}

it("Geo normalizer should return expected result", async () => {
  const provider = new GeoProvider();
  const normalizer = new GeoNormalizerProvider(provider);

  const result = await normalizer.handle({
    start: {
      lat: 0.0001,
      lon: 0.0002,
      datetime: new Date(),
    },
    end: {
      lat: 0.0003,
      lon: 0.0004,
      datetime: new Date(),
    },
  });

  const resultProperties = Reflect.ownKeys(result);
  assert(resultProperties.indexOf("start") > -1);
  assert(Reflect.ownKeys(result.start).indexOf("geo_code") > -1);
  assertEquals(
    result.start.geo_code,
    `${result.start.lat.toString(10)}_${result.start.lon.toString(10)}`,
    "have start.insee property matching lat, lon values",
  );

  assert(resultProperties.indexOf("end") > -1);
  assert(Reflect.ownKeys(result.end).indexOf("geo_code") > -1);
  assertEquals(
    result.end.geo_code,
    `${result.end.lat.toString(10)}_${result.end.lon.toString(10)}`,
    "have end.insee property matching lat, lon values",
  );
});
