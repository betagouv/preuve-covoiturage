import { ConfigInterfaceResolver, handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { internalOnlyMiddlewares } from '@pdc/providers/middleware';
import { SingleResultInterface as AllGeoResultInterface } from '@shared/territory/allGeo.contract';
import { handlerConfig } from '@shared/territory/indexAllGeo.contract';
import { indexData } from '../../helpers/meilisearch';
import { GeoRepositoryProviderInterfaceResolver } from '../../interfaces/GeoRepositoryProviderInterface';

@handler({
  ...handlerConfig,
  middlewares: [...internalOnlyMiddlewares(handlerConfig.service)],
})
export class IndexAllGeoAction extends AbstractAction {
  constructor(
    private config: ConfigInterfaceResolver,
    private geoRepository: GeoRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(): Promise<void> {
    const { host, apiKey, index, batchSize } = this.config.get('meilisearch');
    const allGeo = await this.geoRepository.getAllGeo();
    const response = await indexData<AllGeoResultInterface>({ host, apiKey }, index, batchSize, allGeo);
    return response;
  }
}
