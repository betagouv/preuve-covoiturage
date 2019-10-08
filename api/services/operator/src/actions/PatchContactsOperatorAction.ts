import { handler, ContextType } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { PatchOperatorParamsInterface, OperatorInterface } from '@pdc/provider-schema';

import { OperatorRepositoryProviderInterfaceResolver } from '../interfaces/OperatorRepositoryProviderInterface';

@handler({
  service: 'operator',
  method: 'patchContacts',
})
export class PatchContactsOperatorAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [
    ['can', ['operator.contacts.update']],
    ['validate', 'operator.patchContacts'],
  ];

  constructor(private operatorRepository: OperatorRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(
    params: { _id: string; patch: PatchOperatorParamsInterface },
    context: ContextType,
  ): Promise<OperatorInterface> {
    if (context.call.user.operator) {
      params._id = context.call.user.operator;
    }

    return this.operatorRepository.patch(params._id, {
      contacts: params.patch,
    });
  }
}
