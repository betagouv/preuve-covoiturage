import * as _ from 'lodash';
import { BadRequestError, NotFoundError } from '@pdc/package-errors';

import { GeoType } from './types/GeoType';

const { Aom } = require('@pdc/service-organization').entities.models;
const { validate } = require('@pdc/shared/providers/mongo/schema-validation');
const geoApi = require('./providers/fr.gouv.api.geo');
const addressApi = require('./providers/fr.gouv.data.api-adresse');
const nominatimApi = require('./providers/org.openstreetmap.nominatim');
const komootApi = require('./providers/de.komoot.photon');

/**
 * Search for an AOM object
 * by INSEE or latitude and longitude
 */
const aom = async ({ lon, lat, insee }: GeoType) => {
  if ((_.isNil(lon) || _.isNil(lat)) && _.isNil(insee)) {
    throw new BadRequestError('lon/lat or INSEE must be provided');
  }

  // search by INSEE code
  if (insee) {
    if (!validate('insee', insee)) {
      throw new BadRequestError('Wrong Insee format');
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

const cleanPostcodes = (p) =>
  (Array.isArray(p) ? p : [p].filter((i) => !!i)) || [];

const town = async ({ lon, lat, insee, literal }: GeoType) => {
  if ((_.isNil(lon) || _.isNil(lat)) && _.isNil(insee) && _.isNil(literal)) {
    throw new BadRequestError('lon/lat or INSEE or literal must be provided');
  }

  if (!_.isNil(insee)) validate('insee', insee);
  if (!_.isNil(lon)) validate('lon', lon);
  if (!_.isNil(lat)) validate('lat', lat);

  if (!_.isNil(lon) && !_.isNil(lat)) {
    // beurk...
    try {
      const { citycode, city, postcode, country } = await addressApi.reverse({
        lon,
        lat,
      });
      return {
        lon,
        lat,
        insee: citycode,
        town: city,
        postcodes: cleanPostcodes(postcode),
        country,
      };
    } catch (e) {
      try {
        const { citycode, city, postcode, country } = await geoApi.reverse({
          lon,
          lat,
        });
        return {
          lon,
          lat,
          insee: citycode,
          town: city,
          postcodes: cleanPostcodes(postcode),
          country,
        };
      } catch (f) {
        try {
          const {
            citycode,
            city,
            postcode,
            country,
          } = await nominatimApi.reverse({ lon, lat });
          return {
            lon,
            lat,
            insee: citycode,
            town: city,
            postcodes: cleanPostcodes(postcode),
            country,
          };
        } catch (g) {
          return {
            lon,
            lat,
            insee: null,
            town: null,
            postcodes: [],
            country: null,
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
        lon: null,
        lat: null,
        insee: citycode,
        town: city,
        postcodes: cleanPostcodes(postcode),
        country,
      };
    } catch (e) {
      try {
        const { city, citycode, postcode, country } = await addressApi.insee(
          insee,
        );
        return {
          lon: null,
          lat: null,
          insee: citycode,
          town: city,
          postcodes: cleanPostcodes(postcode),
          country,
        };
      } catch (f) {
        return {
          lon: null,
          lat: null,
          insee: null,
          town: null,
          postcodes: [],
          country: null,
        };
      }
    }
  }

  if (!_.isNil(literal) && literal !== '') {
    // beurk...
    try {
      // use international search first
      const res = await komootApi.search(literal);
      return {
        lon: res.lon,
        lat: res.lat,
        insee: null,
        town: res.city,
        postcodes: cleanPostcodes(res.postcode),
        country: res.country,
      };
    } catch (e) {
      try {
        const { citycode, city, postcode, country } = await addressApi.search(
          literal,
        );
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
          lon,
          lat,
          insee,
          town: null,
          postcodes: [],
          country: null,
        };
      }
    }
  }

  throw new BadRequestError();
};

const inseeCode = async ({ lon, lat }: GeoType) => {
  // tslint:disable-next-line
  const { insee } = await town({ lon, lat });

  return insee;
};

// eslint-disable-next-line no-shadow
const postcodes = async ({ lon, lat, insee }: GeoType) => {
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

export { aom, town, inseeCode as insee, postcodes };
