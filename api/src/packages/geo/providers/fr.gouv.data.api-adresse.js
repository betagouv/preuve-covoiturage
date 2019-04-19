const _ = require('lodash');
const axios = require('axios');
const NotFoundError = require('../../errors/not-found');
const BadRequestError = require('../../errors/bad-request');
const { validate } = require('../../mongo/schema-validation');

const domain = 'https://api-adresse.data.gouv.fr';

module.exports = {
  async insee(code) {
    if (!validate('insee', code)) {
      throw BadRequestError('Wrong Insee format');
    }

    const res = await axios.get(`${domain}/search?q=france&citycode=${code}`);

    if (!_.get(res, 'data.features', []).length) {
      throw new NotFoundError(`INSEE Not found on BAN (${code})`);
    }

    const data = _.get(res, 'data.features', [{ properties: {} }])[0].properties;

    return {
      city: data.city,
      citycode: data.citycode,
      postcode: data.postcode,
      country: 'France',
    };
  },

  /**
   * Reverse geocoding by lon, lat
   *
   * @param lon
   * @param lat
   * @param fallback
   * @returns {Promise<*>}
   */
  async reverse({ lon, lat }) {
    if (!validate('lat', lat)) {
      throw new BadRequestError('Wrong lat format');
    }

    if (!validate('lon', lon)) {
      throw new BadRequestError('Wrong lon format');
    }

    const res = await axios.get(`${domain}/reverse?lon=${lon}&lat=${lat}`);

    if (!_.get(res, 'data.features', []).length) {
      throw new NotFoundError(`Not found on BAN (${lat}, ${lon})`);
    }

    const data = _.get(res, 'data.features', [{ properties: {} }])[0].properties;

    return {
      citycode: data.citycode || null,
      city: data.city || null,
      postcode: data.postcode || [],
      country: (data.citycode && data.city && data.postcode) ? 'France' : null,
    };
  },

  /**
   * Search by address
   *
   * @param literal
   * @param fallback
   * @returns {Promise<*>}
   */
  async search(literal) {
    try {
      const res = await axios.get(`${domain}/search?q=${encodeURIComponent(literal)}`);

      if (!_.get(res, 'data.features', []).length) {
        throw new NotFoundError();
      }

      const data = _.get(res, 'data.features', [{ properties: {} }])[0].properties;

      return {
        citycode: data.citycode || null,
        city: data.city || null,
        postcode: data.postcode || [],
        country: 'France',
      };
    } catch (res) {
      throw new NotFoundError();
    }
  },
};
