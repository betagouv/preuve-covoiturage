import { provider } from '/ilos/common/index.ts';
import { GeoProviderInterfaceResolver } from '/pdc/providers/geo/index.ts';
import { GeoNormalizerProviderInterface, GeoParamsInterface, GeoResultInterface } from '../interfaces/index.ts';

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
