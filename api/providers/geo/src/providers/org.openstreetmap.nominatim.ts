import * as _ from 'lodash';
import axios from 'axios';
import { NotFoundException } from '@ilos/common';

export class OrgOpenstreetmapNominatim {
  private static domain = 'https://nominatim.openstreetmap.org/';

  static async reverse({ lon, lat }: { lon: number; lat: number }) {
    // if (!validate('lat', lat)) {
    //   throw new BadRequestError('Wrong lat format');
    // }
    //
    // if (!validate('lon', lon)) {
    //   throw new BadRequestError('Wrong lon format');
    // }
    const { data } = await axios.get(
      `${OrgOpenstreetmapNominatim.domain}/reverse.php?lon=${lon}&lat=${lat}&format=json&accept-language=fr-fr`,
    );

    if (data.error) {
      throw new NotFoundException(`Not found on Nominatim (${lat}, ${lon}). ${data.error}`);
    }

    return {
      citycode: null,
      city: _.get(data, 'address.city', null),
      postcode: _.get(data, 'address.postcode', null),
      country: _.get(data, 'address.country', null),
    };
  }
}
