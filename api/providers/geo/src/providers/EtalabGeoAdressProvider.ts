import { get } from 'lodash';
import { URLSearchParams } from 'url';
import axios from 'axios';
import { NotFoundException, provider } from '@ilos/common';

import { GeoCoderInterface, PointInterface, InseeCoderInterface } from '../interfaces';
import axiosRetry from 'axios-retry';

@provider()
export class EtalabGeoAdressProvider implements GeoCoderInterface, InseeCoderInterface {
  protected domain = 'https://api-adresse.data.gouv.fr';

  constructor() {
    axiosRetry(axios, {
      retries: 3,
      retryDelay: (retryCount) => retryCount * 2000,
      retryCondition: (error) => error.response.status >= 400,
    });
  }

  async literalToPosition(literal: string): Promise<PointInterface> {
    const params = new URLSearchParams({
      q: literal,
      limit: '1',
      autocomplete: '0',
    });

    const res = await axios.get(`${this.domain}/search`, { params });

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

  async positionToInsee(geo: PointInterface): Promise<string> {
    const { lat, lon } = geo;
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
    });

    const res = await axios.get(`${this.domain}/reverse`, { params });

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
