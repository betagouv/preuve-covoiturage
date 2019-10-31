import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType, NotFoundException } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/application/revoke.contract';
import { alias } from '../shared/application/revoke.schema';
import { ApplicationRepositoryProviderInterfaceResolver } from '../interfaces/ApplicationRepositoryProviderInterface';

@handler(handlerConfig)
export class RevokeApplicationAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [
    ['validate', alias],
    [
      'scopeIt',
      [
        ['application.revoke'],
        [
          (params, context) => {
            if (context.call.user.operator) {
              return 'operator.application.revoke';
            }
          },
        ],
      ],
    ],
  ];

  constructor(private applicationRepository: ApplicationRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    let owner_id: string;
    let owner_service: string;

    // make sure operators can only delete their own applications
    if (context.call.user.operator) {
      owner_id = context.call.user.operator;
      owner_service = 'operator';
    }

    if (context.call.user.territory) {
      owner_id = context.call.user.territory;
      owner_service = 'territory';
    }

    await this.applicationRepository.delete(params._id, owner_id, owner_service);
  }
}
