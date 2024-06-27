import { NotFoundException, provider } from "@/ilos/common/index.ts";
import { axios } from "@/deps.ts";
import { _, axiosRetry, HttpsAgent as Agent, URLSearchParams } from "@/deps.ts";
import {
  GeoCoderInterface,
  InseeCoderInterface,
  PointInterface,
} from "../interfaces/index.ts";

@provider()
export class EtalabBaseAdresseNationaleProvider
  implements GeoCoderInterface, InseeCoderInterface {
  protected domain = "https://api-adresse.data.gouv.fr";
  private static agent = new Agent({ keepAlive: false });

  constructor() {
    axiosRetry(axios, {
      retries: 3,
      retryDelay: (retryCount) => retryCount * 2000,
      retryCondition: (error) => (error.response?.status || 500) >= 400,
    });
  }

  async literalToPosition(literal: string): Promise<PointInterface> {
    const params = new URLSearchParams({
      q: literal,
      limit: "1",
      autocomplete: "0",
    });

    const res = await axios.get(`${this.domain}/search`, {
      params,
      httpsAgent: EtalabBaseAdresseNationaleProvider.agent,
    });

    if (!_.get(res, "data.features", []).length) {
      throw new NotFoundException();
    }

    const [lon, lat] = _.get(res, "data.features.0.geometry.coordinates", [
      null,
      null,
    ]);

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

    const res = await axios.get(`${this.domain}/reverse`, {
      params,
      httpsAgent: EtalabBaseAdresseNationaleProvider.agent,
    });

    if (!_.get(res, "data.features", []).length) {
      throw new NotFoundException(`Not found on BAN (${lat}, ${lon})`);
    }

    const data = _.get(res, "data.features.0.properties.citycode", null);
    if (!data) {
      throw new NotFoundException(`Not found on BAN (${lat}, ${lon})`);
    }
    return data;
  }
}
