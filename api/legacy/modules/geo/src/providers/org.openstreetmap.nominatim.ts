import * as _ from 'lodash';
import axios from 'axios';

const { NotFoundError, BadRequestError } = require('@pdc/shared-errors');
const { validate } = require('@pdc/shared-providers').mongo.schema;

const domain = 'https://nominatim.openstreetmap.org/';

async function reverse({ lon, lat }) {
  if (!validate('lat', lat)) {
    throw new BadRequestError('Wrong lat format');
  }

  if (!validate('lon', lon)) {
    throw new BadRequestError('Wrong lon format');
  }

  const { data } = await axios.get(
    `${domain}/reverse.php?lon=${lon}&lat=${lat}&format=json&accept-language=fr-fr`,
  );

  if (data.error) {
    throw new NotFoundError(
      `Not found on Nominatim (${lat}, ${lon}). ${data.error}`,
    );
  }

  return {
    citycode: null,
    city: _.get(data, 'address.city', null),
    postcode: _.get(data, 'address.postcode', null),
    country: _.get(data, 'address.country', null),
  };
}

export { reverse };
