import { provider } from '@ilos/common';
import { GeoProviderInterfaceResolver } from '@pdc/provider-geo';
import { GeoNormalizerProviderInterface, GeoParamsInterface, GeoResultInterface } from '../interfaces';

@provider()
export class GeoNormalizerProvider implements GeoNormalizerProviderInterface {
  constructor(private geoProvider: GeoProviderInterfaceResolver) {}

  public async handle(params: GeoParamsInterface): Promise<GeoResultInterface> {
    return {
      start: await this.geoProvider.checkAndComplete(params.start),
      end: await this.geoProvider.checkAndComplete(params.end),
    };
  }
}
