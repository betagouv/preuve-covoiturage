import { URLSearchParams } from "@/deps.ts";
import { NotFoundException, provider } from "@/ilos/common/index.ts";
import { get } from "@/lib/object/index.ts";
import {
  GeoCoderInterface,
  InseeCoderInterface,
  PointInterface,
} from "../interfaces/index.ts";

@provider()
export class EtalabBaseAdresseNationaleProvider
  implements GeoCoderInterface, InseeCoderInterface {
  protected domain = "https://api-adresse.data.gouv.fr";

  async literalToPosition(literal: string): Promise<PointInterface> {
    const params = new URLSearchParams({
      q: literal,
      limit: "1",
      autocomplete: "0",
    });

    const response = await fetch(`${this.domain}/search?${params.toString()}`);
    const data = await response.json();

    if (!get(data, "data.features", [])?.length) {
      throw new NotFoundException();
    }

    const [lon, lat] = get(data, "data.features.0.geometry.coordinates", [
      null,
      null,
    ]) as [number | null, number | null];

    if (!lon || !lat) {
      throw new NotFoundException(`Literal not found on BAN (${literal})`);
    }

    return {
      lon,
      lat,
    };
  }

  async positionToInsee(geo: PointInterface): Promise<string> {
    const { lat, lon } = geo;
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
    });

    const response = await fetch(`${this.domain}/reverse?${params.toString()}`);
    const data = await response.json();

    if (!get(data, "data.features", [])?.length) {
      throw new NotFoundException(`Not found on BAN (${lat}, ${lon})`);
    }

    const citycode = get(data, "data.features.0.properties.citycode", null);
    if (!citycode) {
      throw new NotFoundException(`Not found on BAN (${lat}, ${lon})`);
    }
    return citycode;
  }
}
