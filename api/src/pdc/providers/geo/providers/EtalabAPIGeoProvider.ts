import { NotFoundException, provider } from '@ilos/common';
import axios from 'axios';
import { Agent } from 'https';
import { get } from 'lodash';
import { URLSearchParams } from 'url';
import { InseeCoderInterface, PointInterface } from '../interfaces';

@provider()
export class EtalabAPIGeoProvider implements InseeCoderInterface {
  protected domain = 'https://geo.api.gouv.fr';
  private static agent = new Agent({ keepAlive: false });

  async positionToInsee(geo: PointInterface): Promise<string> {
    const { lon, lat } = geo;
    const params = new URLSearchParams({
      lon: lon.toString(),
      lat: lat.toString(),
      fields: 'code',
      format: 'json',
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

    const inseeCode = get(data, 'code', null);
    if (!inseeCode) {
      throw new NotFoundException(`Not found on Geo (${lat}, ${lon})`);
    }

    return inseeCode;
  }

  async inseeToPosition(insee: string): Promise<PointInterface> {
    const params = new URLSearchParams({
      code: insee,
      fields: 'centre',
      format: 'json',
    });
    let { data } = await axios.get(`${this.domain}/communes`, {
      params,
      httpsAgent: EtalabAPIGeoProvider.agent,
    });

    if (!data.length) {
      throw new NotFoundException(`Not found on insee code (${insee})`);
    }

    if (Array.isArray(data)) {
      data = data.shift();
    }

    const [lon, lat] = get(data, 'centre.coordinates', [null, null]);

    if (!lon || !lat) {
      throw new NotFoundException(`Not found on insee code (${insee})`);
    }

    return {
      lon,
      lat,
    };
  }
}
