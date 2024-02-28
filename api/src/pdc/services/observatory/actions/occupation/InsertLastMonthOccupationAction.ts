import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { internalOnlyMiddlewares } from '@pdc/providers/middleware';
import { OccupationRepositoryInterfaceResolver } from '../../interfaces/OccupationRepositoryProviderInterface';
import { handlerConfig, ParamsInterface } from '@shared/observatory/occupation/insertMonthlyOccupation.contract';

@handler({
  ...handlerConfig,
  middlewares: [...internalOnlyMiddlewares(handlerConfig.service)],
})
export class InsertLastMonthOccupationAction extends AbstractAction {
  constructor(private occupationRepository: OccupationRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<void> {
    await this.occupationRepository.deleteOneMonthOccupation(params);
    return this.occupationRepository.insertOneMonthOccupation(params);
  }
}
