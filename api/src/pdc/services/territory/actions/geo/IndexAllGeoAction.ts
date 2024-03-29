import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { internalOnlyMiddlewares } from '@pdc/providers/middleware';
import { GeoRepositoryProviderInterfaceResolver } from '../../interfaces/GeoRepositoryProviderInterface';
import { handlerConfig } from '@shared/territory/indexAllGeo.contract';
import { indexData } from '../../helpers/meilisearch';
import { SingleResultInterface as AllGeoResultInterface } from '@shared/territory/allGeo.contract';
import { config } from '../../config/meilisearch';

@handler({
  ...handlerConfig,
  middlewares: [...internalOnlyMiddlewares(handlerConfig.service)],
})
export class IndexAllGeoAction extends AbstractAction {
  constructor(private geoRepository: GeoRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(): Promise<string> {
    const allGeo = await this.geoRepository.getAllGeo();
    const response = await indexData<AllGeoResultInterface>({host: config.host, apiKey: config.apiKey}, config.index, allGeo);
    return response;
  }
}