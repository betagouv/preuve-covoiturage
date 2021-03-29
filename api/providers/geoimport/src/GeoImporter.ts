import { createGunzip } from 'zlib';
import { Writable } from 'stream';
import axios from 'axios';
import Chain from 'stream-chain';
import { parser } from 'stream-json';
import { pick } from 'stream-json/filters/Pick';
import { streamArray } from 'stream-json/streamers/StreamArray';

import { provider } from '@ilos/common';

import {
  GeoImporterInterfaceResolver,
  GeoImporterInterface,
  ImporterStreamHandlerInterface,
  GeoImporterData,
  GeoImporterDataWithGeo,
  GeoImporterDataWithMeta,
} from './interfaces';
import { GeoImporterError, NotFoundGeoImporterError, ServerUnavailableGeoImporterError } from './GeoImporterError';

@provider({
  identifier: GeoImporterInterfaceResolver,
})
export class GeoImporter implements GeoImporterInterface {
  public readonly baseApiEndpoint = 'https://geo.api.gouv.fr';
  public readonly baseDataSetEndpoint =
    'https://etalab-datasets.geo.data.gouv.fr/contours-administratifs/latest/geojson';

  async process(handlers: ImporterStreamHandlerInterface[] = [], file = 'communes-5m.geojson.gz'): Promise<void> {
    return new Promise((resolve, reject) => {
      axios({
        url: `${this.baseDataSetEndpoint}/${file}`,
        method: 'GET',
        responseType: 'stream',
      })
        .then(({ data }) => {
          const endwritable = new Writable({ objectMode: true });
          endwritable._write = (_object, _encoding, done) => {
            done();
          };

          const stream = new Chain([
            data,
            createGunzip(),
            parser(),
            pick({ filter: 'features' }),
            streamArray(),
            (data: any): GeoImporterDataWithGeo => {
              const value = data.value;
              if (!value) return;
              return {
                codes: [{ type: 'insee', value: value.properties.code }],
                name: value.properties.nom,
                geo: value.geometry,
              };
            },
            ...handlers,
            endwritable,
          ]);
          stream.on('error', (e) => {
            reject(new GeoImporterError(e.message));
          });
          endwritable.on('finish', resolve);
        })
        .catch((e) => {
          if (e.isAxiosError) {
            if (e.response.status === 404) {
              return reject(new NotFoundGeoImporterError(`file ${file} not found`));
            }
            if (e.response.status >= 500) {
              return reject(new ServerUnavailableGeoImporterError(e.message));
            }
          }
          return reject(e);
        });
    });
  }

  async listRegions(): Promise<GeoImporterData[]> {
    try {
      const endpoint = `${this.baseApiEndpoint}/regions`;
      const result = await axios.get(endpoint);
      return result.data.map((r) => ({ name: r.nom, codes: [{ value: r.code, type: 'insee' }] }));
    } catch (e) {
      if (e.isAxiosError && e.response.status >= 500) {
        throw new ServerUnavailableGeoImporterError(e.message);
      }
      throw e;
    }
  }

  async listDistrictsByRegionCode(code: string): Promise<GeoImporterData[]> {
    try {
      const endpoint = `${this.baseApiEndpoint}/regions/${code}/departements`;
      const result = await axios.get(endpoint);
      return result.data.map((r) => ({ name: r.nom, codes: [{ value: r.code, type: 'insee' }] }));
    } catch (e) {
      if (e.isAxiosError) {
        if (e.response.status === 404) {
          throw new NotFoundGeoImporterError(`Region "${code}" is not found`);
        }
        if (e.response.status >= 500) {
          throw new ServerUnavailableGeoImporterError(e.message);
        }
      }
      throw e;
    }
  }

  async listCitiesByDistrictCode(code: string): Promise<GeoImporterDataWithMeta[]> {
    try {
      const params = { fields: 'nom,code,surface,population' };
      const endpoint = `${this.baseApiEndpoint}/departements/${code}/communes`;
      const result = await axios.get(endpoint, { params });
      return result.data.map((r) => ({
        // codesPostaux
        name: r.nom,
        codes: [{ value: r.code, type: 'insee' }],
        population: r.population,
        surface: r.surface,
      }));
    } catch (e) {
      if (e.isAxiosError) {
        if (e.response.status === 404) {
          throw new NotFoundGeoImporterError(`District "${code}" is not found`);
        }
        if (e.response.status >= 500) {
          throw new ServerUnavailableGeoImporterError(e.message);
        }
      }
      throw e;
    }
  }
}
