import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { hasPermissionMiddleware } from '@pdc/providers/middleware';

import { OperatorRepositoryProviderInterfaceResolver } from '../interfaces/OperatorRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '@shared/operator/findbyuuid.contract';
import { alias } from '@shared/operator/findbyuuid.schema';

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware('common.operator.find'), ['validate', alias]],
})
export class FindByUuidOperatorAction extends AbstractAction {
  constructor(private operatorRepository: OperatorRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.operatorRepository.findByUuid(params.uuid);
  }
}
