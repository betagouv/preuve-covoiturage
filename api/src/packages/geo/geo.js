/* eslint-disable camelcase */
const _ = require('lodash');
const NotFoundError = require('../errors/not-found');
const BadRequestError = require('../errors/bad-request');
const Aom = require('../../routes/aom/model');
const { validate } = require('../mongo/schema-validation');
const geoApi = require('./providers/fr.gouv.api.geo');
const addressApi = require('./providers/fr.gouv.data.api-adresse');
const nominatimApi = require('./providers/org.openstreetmap.nominatim');
const komootApi = require('./providers/de.komoot.photon');

/**
 * Search for an AOM object
 * by INSEE or latitude and longitude
 *
 * @param lat
 * @param lon
 * @param insee
 * @returns {Promise<*>}
 */
const aom = async ({ lon, lat, insee }) => {
  if ((_.isNil(lon) || _.isNil(lat)) && _.isNil(insee)) {
    throw new BadRequestError('lon/lat or INSEE must be provided');
  }

  // search by INSEE code
  if (insee) {
    if (!validate('insee', insee)) {
      throw BadRequestError('Wrong Insee format');
    }

    return Aom.findOne({ insee }).exec();
  }

  if (!validate('lat', lat)) {
    throw new BadRequestError('Wrong lat format');
  }

  if (!validate('lon', lon)) {
    throw new BadRequestError('Wrong lon format');
  }

  // search by lat/lon
  return Aom.findOne({
    geometry: {
      $geoIntersects: {
        $geometry: { type: 'Point', coordinates: [lon, lat] },
      },
    },
  }).exec();
};

const cleanPostcodes = p => (Array.isArray(p) ? p : [p].filter(i => !!i)) || [];

const town = async ({ lon, lat, insee, literal }) => {
  if ((_.isNil(lon) || _.isNil(lat)) && _.isNil(insee) && _.isNil(literal)) {
    throw new BadRequestError('lon/lat or INSEE or literal must be provided');
  }

  if (!_.isNil(lon) && !_.isNil(lat)) {
    // beurk...
    try {
      const { citycode, city, postcode, country } = await addressApi.reverse({ lon, lat });
      return {
        insee: citycode,
        town: city,
        postcodes: cleanPostcodes(postcode),
        country,
      };
    } catch (e) {
      try {
        const { citycode, city, postcode, country } = await geoApi.reverse({ lon, lat });
        return {
          insee: citycode,
          town: city,
          postcodes: cleanPostcodes(postcode),
          country,
        };
      } catch (f) {
        try {
          const { citycode, city, postcode, country } = await nominatimApi.reverse({ lon, lat });
          return {
            insee: citycode,
            town: city,
            postcodes: cleanPostcodes(postcode),
            country,
          };
        } catch (g) {
          return {
            insee: null,
            town: null,
            postcodes: [],
          };
        }
      }
    }
  }

  if (!_.isNil(insee)) {
    // beurk...
    try {
      const { city, citycode, postcode, country } = await geoApi.insee(insee);
      return {
        insee: citycode,
        town: city,
        postcodes: cleanPostcodes(postcode),
        country,
      };
    } catch (e) {
      try {
        const { city, citycode, postcode, country } = await addressApi.insee(insee);
        return {
          insee: citycode,
          town: city,
          postcodes: cleanPostcodes(postcode),
          country,
        };
      } catch (f) {
        return {
          insee: null,
          town: null,
          postcodes: [],
        };
      }
    }
  }

  if (!_.isNil(literal) && !_.isEmpty(literal)) {
    // beurk...
    try {
      // use international search first
      const res = await komootApi.search(literal);
      return {
        insee: null,
        lon: res.lon,
        lat: res.lat,
        town: res.city,
        postcodes: cleanPostcodes(res.postcode),
        country: res.country,
      };
    } catch (e) {
      try {
        const { citycode, city, postcode, country } = await addressApi.search(literal);
        return {
          lon,
          lat,
          insee: citycode,
          town: city,
          postcodes: cleanPostcodes(postcode),
          country,
        };
      } catch (f) {
        return {
          insee,
          lon,
          lat,
          town: null,
          postcodes: [],
          country: null,
        };
      }
    }
  }

  throw new BadRequestError();
};

const insee = async ({ lon, lat }) => {
  // eslint-disable-next-line no-shadow
  const { insee } = await town({ lon, lat });

  return insee;
};

// eslint-disable-next-line no-shadow
const postcodes = async ({ lon, lat, insee }) => {
  if ((_.isNil(lon) || _.isNil(lat)) && _.isNil(insee)) {
    throw new BadRequestError('lon/lat or INSEE or literal must be provided');
  }

  if (insee) {
    const data = await geoApi.insee(insee);

    if (!data || !data.codesPostaux) {
      throw new NotFoundError(`geo.postcodes not found: ${insee}`);
    }

    return data.codesPostaux;
  }

  return _.get(await town({ lon, lat }), 'postcodes', []);
};

module.exports = {
  aom,
  town,
  insee,
  postcodes,
};
