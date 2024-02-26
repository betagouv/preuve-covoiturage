import { handler, ContextType } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { copyFromContextMiddleware, hasPermissionByScopeMiddleware } from '@pdc/provider-middleware/dist';

import { OperatorRepositoryProviderInterfaceResolver } from '../interfaces/OperatorRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/operator/patchContacts.contract';
import { alias } from '../shared/operator/patchContacts.schema';
import { phoneComplianceHelper } from '../helpers/phoneComplianceHelper';

@handler({
  ...handlerConfig,
  middlewares: [
    copyFromContextMiddleware('call.user.operator_id', '_id'),
    ['validate', alias],
    hasPermissionByScopeMiddleware('registry.operator.patchContacts', [
      'operator.operator.patchContacts',
      'call.user.operator_id',
      '_id',
    ]),
  ],
})
export class PatchContactsOperatorAction extends AbstractAction {
  constructor(private operatorRepository: OperatorRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    // check phone numbers
    phoneComplianceHelper(params.patch);

    return this.operatorRepository.patch(params._id, {
      contacts: params.patch,
    });
  }
}
