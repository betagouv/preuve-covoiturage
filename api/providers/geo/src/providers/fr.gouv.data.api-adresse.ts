import * as _ from 'lodash';
import axios from 'axios';
import { Exceptions } from '@ilos/core';

const domain = 'https://api-adresse.data.gouv.fr';

export class FrGouvDataApiAdresse {
  static async insee(code: string) {
    // if (!validate('insee', code)) {
    //   throw BadRequestError('Wrong Insee format');
    // }
    const res = await axios.get(`${domain}/search?q=france&citycode=${code}`);

    if (!_.get(res, 'data.features', []).length) {
      throw new Exceptions.NotFoundException(`INSEE Not found on BAN (${code})`);
    }

    const data = _.get(res, 'data.features', [{ properties: {} }])[0].properties;

    return {
      city: data.city,
      citycode: data.citycode,
      postcode: data.postcode,
      country: 'France',
    };
  }

  /**
   * Reverse geocoding by lon, lat
   */
  static async reverse({ lon, lat }: { lon: number; lat: number }) {
    // if (!validate('lat', lat)) {
    //   throw new BadRequestError('Wrong lat format');
    // }
    //
    // if (!validate('lon', lon)) {
    //   throw new BadRequestError('Wrong lon format');
    // }
    const res = await axios.get(`${domain}/reverse?lon=${lon}&lat=${lat}`);

    if (!_.get(res, 'data.features', []).length) {
      throw new Exceptions.NotFoundException(`Not found on BAN (${lat}, ${lon})`);
    }

    const data = _.get(res, 'data.features', [{ properties: {} }])[0].properties;

    return {
      citycode: data.citycode || null,
      city: data.city || null,
      postcode: data.postcode || [],
      country: data.citycode && data.city && data.postcode ? 'France' : null,
    };
  }

  /**
   * Search by address
   */
  static async search(literal: string) {
    try {
      const res = await axios.get(`${domain}/search?q=${encodeURIComponent(literal)}`);

      if (!_.get(res, 'data.features', []).length) {
        throw new Exceptions.NotFoundException();
      }

      const data = _.get(res, 'data.features', [{ properties: {} }])[0].properties;

      return {
        citycode: data.citycode || null,
        city: data.city || null,
        postcode: data.postcode || [],
        country: 'France',
      };
    } catch (res) {
      throw new Exceptions.NotFoundException();
    }
  }
}
