import { axios, HttpAgent } from "@/deps.ts";
import { provider } from "@/ilos/common/index.ts";
import { env_or_fail } from "@/lib/env/index.ts";
import { logger } from "@/lib/logger/index.ts";
import { get } from "@/lib/object/index.ts";
import {
  PointInterface,
  RouteMeta,
  RouteMetaProviderInterface,
} from "../interfaces/index.ts";

@provider()
export class OSRMProvider implements RouteMetaProviderInterface {
  protected domain = env_or_fail(
    "OSRM_URL",
    "http://osrm.covoiturage.beta.gouv.fr:5000",
  );
  private static agent = new HttpAgent({ keepAlive: false });

  async getRouteMeta(
    start: PointInterface,
    end: PointInterface,
  ): Promise<RouteMeta> {
    try {
      const query = `${start.lon},${start.lat};${end.lon},${end.lat}`;

      const res = await axios.get(
        `${this.domain}/route/v1/driving/${encodeURIComponent(query)}`,
        {
          httpAgent: OSRMProvider.agent,
        },
      );
      const distance = get(res, "data.routes.0.distance", null);
      const duration = get(res, "data.routes.0.duration", null);

      if (distance === null || duration === null) {
        throw new Error(
          `Unable to load route meta data for (${start.lon};${start.lat}) -> (${end.lon};${end.lat}) on ${this.domain}`,
        );
      }

      return { distance, duration };
    } catch (e) {
      logger.error(
        `[OSRMProvider] (${start.lon},${start.lat};${end.lon},${end.lat})`,
      );
      switch (e.response?.status) {
        case 429:
          throw new Error(`[OSRMProvider] Too many requests on ${this.domain}`);
        default:
          throw e;
      }
    }
  }
}
