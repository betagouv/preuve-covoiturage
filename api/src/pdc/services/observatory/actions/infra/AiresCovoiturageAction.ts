import { Action as AbstractAction } from '/ilos/core/index.ts';
import { handler } from '/ilos/common/index.ts';
import { hasPermissionMiddleware } from '/pdc/providers/middleware/index.ts';

import { alias } from '/shared/observatory/infra/airesCovoiturage.schema.ts';
import { handlerConfig, ResultInterface, ParamsInterface } from '/shared/observatory/infra/airesCovoiturage.contract.ts';
import { InfraRepositoryInterfaceResolver } from '../../interfaces/InfraRepositoryProviderInterface.ts';

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
