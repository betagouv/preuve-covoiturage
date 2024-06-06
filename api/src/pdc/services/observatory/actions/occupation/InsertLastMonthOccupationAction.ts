import { handler } from '@/ilos/common/index.ts';
import { Action as AbstractAction } from '@/ilos/core/index.ts';
import { internalOnlyMiddlewares } from '@/pdc/providers/middleware/index.ts';
import { OccupationRepositoryInterfaceResolver } from '../../interfaces/OccupationRepositoryProviderInterface.ts';
import { handlerConfig, ParamsInterface } from '@/shared/observatory/occupation/insertMonthlyOccupation.contract.ts';

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
