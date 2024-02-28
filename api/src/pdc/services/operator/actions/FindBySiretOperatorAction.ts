import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { hasPermissionMiddleware } from '@pdc/providers/middleware';

import { OperatorRepositoryProviderInterfaceResolver } from '../interfaces/OperatorRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '@shared/operator/findbysiret.contract';
import { alias } from '@shared/operator/findbysiret.schema';

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware('common.operator.find'), ['validate', alias]],
})
export class FindBySiretOperatorAction extends AbstractAction {
  constructor(private operatorRepository: OperatorRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.operatorRepository.findBySiret(params.siret);
  }
}
