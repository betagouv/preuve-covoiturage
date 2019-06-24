import * as _ from 'lodash';
import axios from 'axios';

import { Exceptions } from '@ilos/core';

export class FrGouvApiGeo {
  private static domain = 'https://geo.api.gouv.fr';

  static async insee(code: string) {
    // if (!validate('insee', code)) {
    //   throw BadRequestError('Wrong Insee format');
    // }

    let { data } = await axios.get(`${FrGouvApiGeo.domain}/communes/${code}`);
    if (Array.isArray(data)) {
      data = data.shift();
    }

    return {
      citycode: _.get(data, 'code', null),
      city: _.get(data, 'nom', null),
      postcode: _.get(data, 'codesPostaux', null),
      country: 'France',
    };
  }

  static async reverse({ lon, lat }) {
    // if (!validate('lat', lat)) {
    //   throw new BadRequestError('Wrong lat format');
    // }
    //
    // if (!validate('lon', lon)) {
    //   throw new BadRequestError('Wrong lon format');
    // }

    let { data } = await axios.get(
      `${FrGouvApiGeo.domain}/communes?lon=${lon}&lat=${lat}&fields=nom,code,codesPostaux&format=json`,
    );
    if (!data.length) {
      throw new Exceptions.NotFoundException(`Not found on Geo (${lat}, ${lon})`);
    }

    if (Array.isArray(data)) {
      data = data.shift();
    }

    return {
      citycode: _.get(data, 'code', null),
      city: _.get(data, 'nom', null),
      postcode: _.get(data, 'codesPostaux', null),
      country: 'France',
    };
  }
}
