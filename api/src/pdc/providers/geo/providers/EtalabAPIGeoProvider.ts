import { NotFoundException, provider } from "@/ilos/common/index.ts";
import fetcher from "@/lib/fetcher/index.ts";
import { get } from "@/lib/object/index.ts";
import { URLSearchParams } from "dep:url";
import { InseeCoderInterface, PointInterface } from "../interfaces/index.ts";

@provider()
export class EtalabAPIGeoProvider implements InseeCoderInterface {
  protected domain = "https://geo.api.gouv.fr";

  async positionToInsee(geo: PointInterface): Promise<string> {
    const { lon, lat } = geo;
    const params = new URLSearchParams({
      lon: lon.toString(),
      lat: lat.toString(),
      fields: "code",
      format: "json",
    });

    const response = await fetcher.get(
      `${this.domain}/communes?${params.toString()}`,
    );
    let data = await response.json();

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
    const response = await fetcher.get(
      `${this.domain}/communes?${params.toString()}`,
    );
    let data = await response.json();

    if (!data.length) {
      throw new NotFoundException(`Not found on INSEE Code (${insee})`);
    }

    if (Array.isArray(data)) {
      data = data.shift();
    }

    const [lon, lat] = get(data, "centre.coordinates", [null, null]) as [
      number | null,
      number | null,
    ];

    if (!lon || !lat) {
      throw new NotFoundException(`Not found on INSEE Code (${insee})`);
    }

    return {
      lon,
      lat,
    };
  }
}
