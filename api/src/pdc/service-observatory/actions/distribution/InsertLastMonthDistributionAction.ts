import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware';
import { DistributionRepositoryInterfaceResolver } from '../../interfaces/DistributionRepositoryProviderInterface';
import {
  handlerConfig,
  ParamsInterface,
} from '@shared/observatory/distribution/insertMonthlyDistribution.contract';

@handler({
  ...handlerConfig,
  middlewares: [...internalOnlyMiddlewares(handlerConfig.service)],
})
export class InsertLastMonthDistributionAction extends AbstractAction {
  constructor(private distributionRepository: DistributionRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<void> {
    await this.distributionRepository.deleteOneMonthDistribution(params);
    return this.distributionRepository.insertOneMonthDistribution(params);
  }
}
