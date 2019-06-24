import { Container, Exceptions, Interfaces } from '@ilos/core';
import * as _ from 'lodash';

import { GeoInterface } from './interfaces/GeoInterface';
import { PositionInterface } from './interfaces/PositionInterface';

import { DeKomootPhoton } from './providers/de.komoot.photon';
import { FrGouvDataApiAdresse } from './providers/fr.gouv.data.api-adresse';
import { FrGouvApiGeo } from './providers/fr.gouv.api.geo';
import { OrgOpenstreetmapNominatim } from './providers/org.openstreetmap.nominatim';

@Container.provider()
export class GeoProvider implements Interfaces.ProviderInterface {
  async boot() {}

  public async getTown({ lon, lat, insee, literal }: GeoInterface): Promise<PositionInterface> {
    if ((_.isNil(lon) || _.isNil(lat)) && _.isNil(insee) && _.isNil(literal)) {
      throw new Exceptions.InvalidParamsException('lon/lat or INSEE or literal must be provided');
    }

    // if (!_.isNil(insee)) validate('insee', insee);
    // if (!_.isNil(lon)) validate('lon', lon);
    // if (!_.isNil(lat)) validate('lat', lat);

    if (!_.isNil(lon) && !_.isNil(lat)) {
      // beurk...
      try {
        const { citycode, city, postcode, country } = await FrGouvDataApiAdresse.reverse({
          lon,
          lat,
        });
        return {
          lon,
          lat,
          country,
          insee: citycode,
          town: city,
          postcodes: this.cleanPostcodes(postcode),
        };
      } catch (e) {
        try {
          const { citycode, city, postcode, country } = await FrGouvApiGeo.reverse({
            lon,
            lat,
          });
          return {
            lon,
            lat,
            country,
            insee: citycode,
            town: city,
            postcodes: this.cleanPostcodes(postcode),
          };
        } catch (f) {
          try {
            const { citycode, city, postcode, country } = await OrgOpenstreetmapNominatim.reverse({ lon, lat });
            return {
              lon,
              lat,
              country,
              insee: citycode,
              town: city,
              postcodes: this.cleanPostcodes(postcode),
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
        const { city, citycode, postcode, country } = await FrGouvApiGeo.insee(insee);

        return {
          country,
          lon: null,
          lat: null,
          insee: citycode,
          town: city,
          postcodes: this.cleanPostcodes(postcode),
        };
      } catch (e) {
        try {
          const { city, citycode, postcode, country } = await FrGouvDataApiAdresse.insee(insee);
          return {
            country,
            lon: null,
            lat: null,
            insee: citycode,
            town: city,
            postcodes: this.cleanPostcodes(postcode),
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
        const res = await DeKomootPhoton.search(literal);
        return {
          lon: res.lon,
          lat: res.lat,
          insee: null,
          town: res.city,
          postcodes: this.cleanPostcodes(res.postcode),
          country: res.country,
        };
      } catch (e) {
        try {
          const { citycode, city, postcode, country } = await FrGouvDataApiAdresse.search(literal);
          return {
            lon,
            lat,
            country,
            insee: citycode,
            town: city,
            postcodes: this.cleanPostcodes(postcode),
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

    throw new Exceptions.InvalidParamsException();
  }

  private cleanPostcodes(p) {
    return (Array.isArray(p) ? p : [p].filter((i) => !!i)) || [];
  }
}
