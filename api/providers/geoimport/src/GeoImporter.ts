import zlib from 'zlib';
import axios from 'axios';
import { chain } from 'stream-chain';
import { parser } from 'stream-json';
import { pick } from 'stream-json/filters/Pick';
import { streamArray } from 'stream-json/streamers/StreamArray';

import { provider } from '@ilos/common';

import { GeoImporterInterfaceResolver, GeoImporterInterface } from './interfaces/GeoImporterInterface';
import { ImporterStreamHandlerInterface } from './interfaces/ImporterStreamHandlerInterface';
import { GeoImporterData, GeoImporterDataWithGeo, GeoImporterDataWithMeta } from './interfaces/GeoImporterData';
import { GeoImporterError } from './GeoImporterError';

@provider({
  identifier: GeoImporterInterfaceResolver,
})
export class GeoImporter implements GeoImporterInterface {
  public readonly baseApiEndpoint = 'https://geo.api.gouv.fr';

  async process(url: string, handlers: ImporterStreamHandlerInterface[]): Promise<void> {
    const { data } = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });

    const stream = data.pipe(
        chain([
          zlib.createGunzip(),
          parser(),
          pick({ filter: 'features' }),
          streamArray(),
          (data: any): GeoImporterDataWithGeo => {
            const value = data.value;
            if (!value) return;
            return {
                code: { type: 'insee', value: value.properties.code },
                name: value.properties.nom,
                geo: value.geometry,
            }
          },
          ...handlers
        ]),
      );

    return new Promise((resolve, reject) => {
        stream.on('end', resolve);
        stream.on('error', (e: Error) => reject(new GeoImporterError(e.message)));
    })
  }

  async listRegions(): Promise<GeoImporterData[]> {
    const endpoint = `${this.baseApiEndpoint}/regions`;
    const result = await axios.get(endpoint);
    return result.data.map(r => ({ name: r.nom, codes: [{value: r.code, type: 'insee'}] }));
  }

  async listDistrictsByRegionCode(code: string): Promise<GeoImporterData[]> {
    const endpoint = `${this.baseApiEndpoint}/regions/${code}/departements`;
    const result = await axios.get(endpoint);
    return result.data.map(r => ({ name: r.nom, codes: [{value: r.code, type: 'insee'}] }));
  }

  async listCitiesByDistrictCode(code: string): Promise<GeoImporterDataWithMeta[]> {
    const endpoint = `${this.baseApiEndpoint}/departements/${code}/communes?fields=nom,code,surface,population`;
    const result = await axios.get(endpoint);
    return result.data.map(r => ({ name: r.nom, codes: [{value: r.code, type: 'insee'}], population: r.population, surface: r.surface}));
  }
}
