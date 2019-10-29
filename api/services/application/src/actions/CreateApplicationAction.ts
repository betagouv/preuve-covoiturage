import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { TokenProviderInterfaceResolver } from '@pdc/provider-token';
import { ApplicationInterface, CreateApplicationParamsInterface } from '@pdc/provider-schema';

import { Application } from '../entities/Application';
import { ApplicationRepositoryProviderInterfaceResolver } from '../interfaces';

@handler({
  service: 'application',
  method: 'create',
})
export class CreateApplicationAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [
    ['validate', 'application.create'],
    [
      'scopeIt',
      [
        ['application.create'],
        [
          (params, context) => {
            // make sure the operator_id in the params matches the one of the user
            // if this is an operator to scope an operator to its own data
            if (
              context.call.user.operator &&
              'operator_id' in params &&
              params.operator_id === context.call.user.operator
            ) {
              return 'operator.application.create';
            }
          },
        ],
      ],
    ],
  ];

  constructor(
    private applicationRepository: ApplicationRepositoryProviderInterfaceResolver,
    private tokenProvider: TokenProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(
    params: CreateApplicationParamsInterface,
  ): Promise<{ token: string; application: ApplicationInterface }> {
    const application = await (<Promise<Application>>(
      this.applicationRepository.create({ ...params, created_at: new Date() })
    ));

    const token = await this.tokenProvider.sign({
      a: application._id.toString(),
      o: application.operator_id,
      p: ['journey.create'],
      v: 2,
    });

    return { token, application };
  }
}
