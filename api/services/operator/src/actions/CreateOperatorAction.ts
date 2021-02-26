import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { hasPermissionMiddleware } from '@pdc/provider-middleware';

import { phoneComplianceHelper } from '../helpers/phoneComplianceHelper';
import { OperatorRepositoryProviderInterfaceResolver } from '../interfaces/OperatorRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/operator/create.contract';
import { alias } from '../shared/operator/create.schema';

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware('registry.operator.create'), ['validate', alias]],
})
export class CreateOperatorAction extends AbstractAction {
  constructor(private operatorRepository: OperatorRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    // check phone numbers
    phoneComplianceHelper(params.contacts);

    return this.operatorRepository.create(params);
  }
}
