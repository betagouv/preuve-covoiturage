import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { TokenProviderInterfaceResolver } from '@pdc/provider-token';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/application/create.contract';
import { ApplicationInterface } from '../shared/application/common/interfaces/ApplicationInterface';
import { alias } from '../shared/application/create.schema';
import { ApplicationRepositoryProviderInterfaceResolver } from '../interfaces/ApplicationRepositoryProviderInterface';

@handler(handlerConfig)
export class CreateApplicationAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [
    ['validate', alias],
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

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    const application = await (<Promise<ApplicationInterface>>(
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
