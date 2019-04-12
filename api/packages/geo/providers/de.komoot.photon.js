const _ = require('lodash');
const axios = require('axios');
const NotFoundError = require('@pdc/shared/errors/not-found');

const domain = 'https://photon.komoot.de/api';

module.exports = {
  async search(query) {
    const res = await axios.get(`${domain}/?q=${encodeURIComponent(query)}&limit=1`);

    if (!_.get(res, 'data.features', []).length) {
      throw new NotFoundError(`Literal not found on Komoot (${query})`);
    }

    const data = _.get(res, 'data.features', [{ properties: {} }])[0];

    return {
      lon: _.get(data, 'geometry.coordinates', [null])[0],
      lat: _.get(data, 'geometry.coordinates', [null, null])[1],
      city: _.get(data, 'properties.city', null),
      postcode: _.get(data, 'properties.postcode', null),
      country: _.get(data, 'properties.country', null),
    };
  },
};
