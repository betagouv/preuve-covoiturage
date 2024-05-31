import { handler, ContextType } from '@ilos/common/index.ts';
import { Action as AbstractAction } from '@ilos/core/index.ts';
import { copyFromContextMiddleware, hasPermissionByScopeMiddleware } from '@pdc/providers/middleware/index.ts';

import { OperatorRepositoryProviderInterfaceResolver } from '../interfaces/OperatorRepositoryProviderInterface.ts';
import { handlerConfig, ParamsInterface, ResultInterface } from '@shared/operator/patchContacts.contract.ts';
import { alias } from '@shared/operator/patchContacts.schema.ts';
import { phoneComplianceHelper } from '../helpers/phoneComplianceHelper.ts';

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
