const _ = require('lodash');
const axios = require('axios');
const NotFoundError = require('@pdc/shared/errors/not-found');
const BadRequestError = require('@pdc/shared/errors/bad-request');
const { validate } = require('@pdc/shared/providers/mongo/schema-validation');

const domain = 'https://geo.api.gouv.fr';

module.exports = {
  async insee(code) {
    if (!validate('insee', code)) {
      throw BadRequestError('Wrong Insee format');
    }

    const { data } = await axios.get(`${domain}/communes/${code}`);

    return {
      citycode: _.get(data[0], 'code', null),
      city: _.get(data[0], 'nom', null),
      postcode: _.get(data[0], 'codesPostaux', null),
      country: 'France',
    };
  },

  async reverse({ lon, lat }) {
    if (!validate('lat', lat)) {
      throw new BadRequestError('Wrong lat format');
    }

    if (!validate('lon', lon)) {
      throw new BadRequestError('Wrong lon format');
    }

    const { data } = await axios.get(`${domain}/communes?lon=${lon}&lat=${lat}&fields=nom,code,codesPostaux&format=json`);

    if (!data.length) {
      throw new NotFoundError(`Not found on Geo (${lat}, ${lon})`);
    }

    return {
      citycode: _.get(data[0], 'code', null),
      city: _.get(data[0], 'nom', null),
      postcode: _.get(data[0], 'codesPostaux', null),
      country: 'France',
    };
  },
};
