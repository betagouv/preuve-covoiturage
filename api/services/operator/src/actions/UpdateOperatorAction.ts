import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { copyFromContextMiddleware, hasPermissionByScopeMiddleware } from '@pdc/provider-middleware/dist';

import { phoneComplianceHelper } from '../helpers/phoneComplianceHelper';
import { OperatorRepositoryProviderInterfaceResolver } from '../interfaces/OperatorRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared//operator/update.contract';
import { alias } from '../shared/operator/update.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    copyFromContextMiddleware('call.user.operator_id', '_id'),
    ['validate', alias],
    hasPermissionByScopeMiddleware('registry.operator.update', [
      'operator.operator.update',
      'call.user.operator_id',
      '_id',
    ]),
  ],
})
export class UpdateOperatorAction extends AbstractAction {
  constructor(private operatorRepository: OperatorRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    // check phone numbers
    phoneComplianceHelper(params.contacts);

    return this.operatorRepository.update(params);
  }
}
