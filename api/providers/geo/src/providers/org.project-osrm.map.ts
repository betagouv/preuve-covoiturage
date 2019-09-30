import { get } from 'lodash';
import axios from 'axios';

import { PointInterface } from '../interfaces/PointInterface';

export class OrgProjectOsrm {
  static async route(start: PointInterface, end: PointInterface): Promise<{ distance: number; duration: number }> {
    return new Promise((resolve, reject) => {
      const url = 'http://router.project-osrm.org';
      const query = `${start.lon},${start.lat};${end.lon},${end.lat}`;

      axios
        .get(`${url}/route/v1/driving/${encodeURIComponent(query)}`)
        .then((res) => {
          const route = get(res, 'data.routes', [{}])[0];
          const distance = get(route, 'distance', null);
          const duration = get(route, 'duration', null);

          if (!distance || !duration) reject();
          else resolve({ distance, duration });
        })
        .catch(reject);
    });
  }
}
