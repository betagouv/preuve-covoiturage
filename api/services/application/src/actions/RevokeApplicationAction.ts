import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType, NotFoundException } from '@ilos/common';
import { ApplicationInterface, RevokeApplicationParamsInterface } from '@pdc/provider-schema';

import { ApplicationRepositoryProviderInterfaceResolver } from '../interfaces';

@handler({
  service: 'application',
  method: 'revoke',
})
export class RevokeApplicationAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [
    ['validate', 'application.revoke'],
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

  public async handle(params: RevokeApplicationParamsInterface, context: ContextType): Promise<boolean> {
    // make sure operators can only delete their own applications
    if (context.call.user.operator) {
      params.operator_id = context.call.user.operator;
    }

    const deleted = await this.applicationRepository.softDelete(params);

    if (!deleted) {
      throw new NotFoundException();
    }

    return true;
  }
}
