import * as _ from 'lodash';
import axios from 'axios';
import { Exceptions } from '@ilos/core';


export class DeKomootPhoton {
  private static domain = 'https://photon.komoot.de/api';

  static async search(query) {
    const res = await axios.get(
      `${DeKomootPhoton.domain}/?q=${encodeURIComponent(query)}&limit=1`,
    );

    if (!_.get(res, 'data.features', []).length) {
      throw new Exceptions.NotFoundException(`Literal not found on Komoot (${query})`);
    }

    const data = _.get(res, 'data.features', [{ properties: {} }])[0];

    return {
      lon: _.get(data, 'geometry.coordinates', [null])[0],
      lat: _.get(data, 'geometry.coordinates', [null, null])[1],
      city: _.get(data, 'properties.city', null),
      postcode: _.get(data, 'properties.postcode', null),
      country: _.get(data, 'properties.country', null),
    };
  }
}

