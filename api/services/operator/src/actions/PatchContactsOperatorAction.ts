import { handler, ContextType } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

import { OperatorRepositoryProviderInterfaceResolver } from '../interfaces/OperatorRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared//operator/patchContacts.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { alias } from '../shared/operator/patchContacts.schema';

@handler(handlerConfig)
export class PatchContactsOperatorAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [['can', ['operator.contacts.update']], ['validate', alias]];

  constructor(private operatorRepository: OperatorRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    if (context.call.user.operator_id) {
      params._id = context.call.user.operator_id;
    }

    return this.operatorRepository.patch(params._id, {
      contacts: params.patch,
    });
  }
}
