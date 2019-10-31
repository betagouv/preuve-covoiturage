import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/application/list.contract';
import { alias } from '../shared/application/list.schema';
import { ApplicationRepositoryProviderInterfaceResolver } from '../interfaces/ApplicationRepositoryProviderInterface';

@handler(handlerConfig)
export class ListApplicationAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [
    ['validate', alias],
    [
      'scopeIt',
      [
        ['application.list'],
        [
          (params, context) => {
            // make sure the operator_id in the params matches the one of the user
            // if this is an operator to scope an operator to its own data
            if (
              context.call.user.operator &&
              'operator_id' in params &&
              params.operator_id === context.call.user.operator
            ) {
              return 'operator.application.list';
            }
          },
        ],
      ],
    ],
  ];

  constructor(private applicationRepository: ApplicationRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    // TODO other use cases
    return this.applicationRepository.allByOperator(params.operator_id);
  }
}
