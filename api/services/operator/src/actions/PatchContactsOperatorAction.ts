import { handler, ContextType } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

import { OperatorRepositoryProviderInterfaceResolver } from '../interfaces/OperatorRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared//operator/patchContacts.contract';
import { alias } from '../shared/operator/patchContacts.schema';
import { phoneComplianceHelper } from '../helpers/phoneComplianceHelper';

@handler({
  ...handlerConfig,
  middlewares: [
    ['can', ['operator.contacts.update']],
    ['validate', alias],
  ],
})
export class PatchContactsOperatorAction extends AbstractAction {
  constructor(private operatorRepository: OperatorRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    if (context.call.user.operator_id) {
      params._id = context.call.user.operator_id;
    }

    // check phone numbers
    phoneComplianceHelper(params.patch);

    return this.operatorRepository.patch(params._id, {
      contacts: params.patch,
    });
  }
}
