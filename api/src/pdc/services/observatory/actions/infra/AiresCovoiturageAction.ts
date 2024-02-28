import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { hasPermissionMiddleware } from '@pdc/providers/middleware';

import { alias } from '@shared/observatory/infra/airesCovoiturage.schema';
import {
  handlerConfig,
  ResultInterface,
  ParamsInterface,
} from '@shared/observatory/infra/airesCovoiturage.contract';
import { InfraRepositoryInterfaceResolver } from '../../interfaces/InfraRepositoryProviderInterface';

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware('common.observatory.stats'), ['validate', alias]],
})
export class AiresCovoiturageAction extends AbstractAction {
  constructor(private repository: InfraRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.repository.getAiresCovoiturage(params);
  }
}
