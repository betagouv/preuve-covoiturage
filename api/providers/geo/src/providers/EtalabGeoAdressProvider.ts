import { get }from 'lodash';
import axios from 'axios';
import { NotFoundException } from '@ilos/common';

import { GeoCoderInterface, PointInterface, InseeCoderInterface } from '../interfaces';

export class EtalabGeoAdressProvider implements GeoCoderInterface, InseeCoderInterface {
  protected domain = 'https://api-adresse.data.gouv.fr';

  async toPosition(literal: string): Promise<PointInterface> {
    const res = await axios.get(`${this.domain}/search?q=${encodeURIComponent(literal)}&limit=1&autocomplete=0`);

    if (!get(res, 'data.features', []).length) {
      throw new NotFoundException();
    }

    const [lon, lat] = get(res, 'data.features.0.geometry.coordinates', [null, null]);

    if (!lon || !lat) {
      throw new NotFoundException(`Literal not found on BAN (${literal})`);
    }

    return {
      lon,
      lat,
    };
  }
  async toInsee(geo: PointInterface): Promise<string> {
    const { lat, lon } = geo;
    const res = await axios.get(`${this.domain}/reverse?lon=${lon}&lat=${lat}`);

    if (!get(res, 'data.features', []).length) {
      throw new NotFoundException(`Not found on BAN (${lat}, ${lon})`);
    }

    const data = get(res, 'data.features.0.properties.citycode', null);
    if (!data) {
      throw new NotFoundException(`Not found on BAN (${lat}, ${lon})`);
    }
    return data;
  }
}
