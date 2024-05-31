import { ConfigInterfaceResolver, handler } from '@ilos/common/index.ts';
import { Action as AbstractAction } from '@ilos/core/index.ts';
import { internalOnlyMiddlewares } from '@pdc/providers/middleware/index.ts';
import { SingleResultInterface as AllGeoResultInterface } from '@shared/territory/allGeo.contract.ts';
import { handlerConfig } from '@shared/territory/indexAllGeo.contract.ts';
import { indexData } from '../../helpers/meilisearch.ts';
import { GeoRepositoryProviderInterfaceResolver } from '../../interfaces/GeoRepositoryProviderInterface.ts';

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
