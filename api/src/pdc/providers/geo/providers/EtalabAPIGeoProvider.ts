import { axios, HttpsAgent as Agent, URLSearchParams } from "@/deps.ts";
import { NotFoundException, provider } from "@/ilos/common/index.ts";
import { get } from "@/lib/object/index.ts";
import { InseeCoderInterface, PointInterface } from "../interfaces/index.ts";

@provider()
export class EtalabAPIGeoProvider implements InseeCoderInterface {
  protected domain = "https://geo.api.gouv.fr";
  private static agent = new Agent({ keepAlive: false });

  async positionToInsee(geo: PointInterface): Promise<string> {
    const { lon, lat } = geo;
    const params = new URLSearchParams({
      lon: lon.toString(),
      lat: lat.toString(),
      fields: "code",
      format: "json",
    });

    let { data } = await axios.get(`${this.domain}/communes`, {
      params,
      httpsAgent: EtalabAPIGeoProvider.agent,
    });

    if (!data.length) {
      throw new NotFoundException(`Not found on Geo (${lat}, ${lon})`);
    }

    if (Array.isArray(data)) {
      data = data.shift();
    }

    const inseeCode = get(data, "code", null);
    if (!inseeCode) {
      throw new NotFoundException(`Not found on Geo (${lat}, ${lon})`);
    }

    return inseeCode;
  }

  async inseeToPosition(insee: string): Promise<PointInterface> {
    const params = new URLSearchParams({
      code: insee,
      fields: "centre",
      format: "json",
    });
    let { data } = await axios.get(`${this.domain}/communes`, {
      params,
      httpsAgent: EtalabAPIGeoProvider.agent,
    });

    if (!data.length) {
      throw new NotFoundException(`Not found on INSEE Code (${insee})`);
    }

    if (Array.isArray(data)) {
      data = data.shift();
    }

    const [lon, lat] = get(data, "centre.coordinates", [null, null]);

    if (!lon || !lat) {
      throw new NotFoundException(`Not found on INSEE Code (${insee})`);
    }

    return {
      lon,
      lat,
    };
  }
}
