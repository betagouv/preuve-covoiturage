import { get } from 'lodash';
import axios from 'axios';
import { provider } from '@ilos/common';

import { PointInterface, RouteMetaProviderInterface, RouteMeta } from '../interfaces';

@provider()
export class OSRMProvider implements RouteMetaProviderInterface {
  protected domain = 'http://osrm.covoiturage.beta.gouv.fr:5000';

  async getRouteMeta(start: PointInterface, end: PointInterface): Promise<RouteMeta> {
    try {
      const query = `${start.lon},${start.lat};${end.lon},${end.lat}`;

      const res = await axios.get(`${this.domain}/route/v1/driving/${encodeURIComponent(query)}`);
      const distance = get(res, 'data.routes.0.distance', null);
      const duration = get(res, 'data.routes.0.duration', null);

      if (distance === null || duration === null) {
        throw new Error(
          `Unable to load route meta data for (${start.lon};${start.lat}) -> (${end.lon};${end.lat}) on ${this.domain}`,
        );
      }

      return { distance, duration };
    } catch (e) {
      console.error('OSRMProvider', e);
      switch (e.response?.status) {
        case 429:
          throw new Error(`Too many requests on ${this.domain}`);
        default:
          throw e;
      }
    }
  }
}
