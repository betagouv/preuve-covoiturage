import { Action } from '@ilos/core/index.ts';
import { handler, ContextType } from '@ilos/common/index.ts';
import { internalOnlyMiddlewares } from '@pdc/providers/middleware/index.ts';

import { handlerConfig, ParamsInterface, ResultInterface } from '@shared/carpool/updateStatus.contract.ts';
import { CarpoolRepositoryProviderInterfaceResolver } from '../interfaces/CarpoolRepositoryProviderInterface.ts';

/*
 * Import journey in carpool database
 */
@handler({
  ...handlerConfig,
  middlewares: [...internalOnlyMiddlewares('acquisition', 'fraudcheck')],
})
export class UpdateStatusAction extends Action {
  constructor(private carpool: CarpoolRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle({ acquisition_id, status }: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    await this.carpool.updateStatus(acquisition_id, status);
  }
}
