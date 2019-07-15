import { Parents, Container } from '@ilos/core';

import {
  ApplicationInterface,
  AllApplicationParamsInterface,
  ApplicationRepositoryProviderInterfaceResolver,
} from '../interfaces';

@Container.handler({
  service: 'application',
  method: 'all',
})
export class AllApplicationAction extends Parents.Action {
  public readonly middlewares: (string | [string, any])[] = [
    ['validate', 'application.all'],
    [
      'scopeIt',
      [
        ['application.all'],
        [
          (params, context) => {
            // make sure the operator_id in the params matches the one of the user
            // if this is an operator to scope an operator to its own data
            if (
              context.call.user.operator &&
              'operator_id' in params &&
              params.operator_id === context.call.user.operator
            ) {
              return 'operator.application.all';
            }
          },
        ],
      ],
    ],
  ];

  constructor(private applicationRepository: ApplicationRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: AllApplicationParamsInterface): Promise<ApplicationInterface[]> {
    return this.applicationRepository.allByOperator({ operator_id: params.operator_id });
  }
}
