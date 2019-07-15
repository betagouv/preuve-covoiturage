import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import {
  ApplicationInterface,
  FindApplicationParamsInterface,
  ApplicationRepositoryProviderInterfaceResolver,
} from '../interfaces';

@handler({
  service: 'application',
  method: 'find',
})
export class FindApplicationAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [
    ['validate', 'application.find'],
    [
      'scopeIt',
      [
        ['application.find'],
        [
          (params, context) => {
            // make sure the operator_id in the params matches the one of the user
            // if this is an operator to scope an operator to its own data
            if (
              context.call.user.operator &&
              'operator_id' in params &&
              params.operator_id === context.call.user.operator
            ) {
              return 'operator.application.find';
            }
          },
        ],
      ],
    ],
  ];

  constructor(private applicationRepository: ApplicationRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: FindApplicationParamsInterface): Promise<ApplicationInterface> {
    return this.applicationRepository.find(params._id);
  }
}
