import { get } from 'lodash';
import axios from 'axios';
import { NotFoundException } from '@ilos/common';
import { InseeCoderInterface, PointInterface } from '../interfaces';

export class EtalabGeoAdministriveProvider implements InseeCoderInterface {
  protected domain = 'https://geo.api.gouv.fr';

  async toInsee(geo: PointInterface): Promise<string> {
    const { lon, lat } = geo;

    let { data } = await axios.get(
      `${this.domain}/communes?lon=${lon}&lat=${lat}&fields=code&format=json`,
    );

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
}
