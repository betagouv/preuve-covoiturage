import { get } from 'lodash';
import { ContextType, handler, KernelInterfaceResolver } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { Sentry } from '@pdc/provider-sentry';

import { OperatorRepositoryProviderInterfaceResolver } from '../interfaces/OperatorRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/operator/delete.contract';
import { alias } from '../shared/operator/delete.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    ['can', ['operator.delete']],
    ['validate', alias],
  ],
})
export class DeleteOperatorAction extends AbstractAction {
  constructor(
    private kernel: KernelInterfaceResolver,
    private operatorRepository: OperatorRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    await this.operatorRepository.delete(params._id);

    const ctx = { channel: { service: 'operator' } };

    // delete users associated with this operator
    try {
      await this.kernel.call('user:deleteAssociated', { operator_id: params._id }, ctx);
      console.log(`> deleted associated users to operator ${params._id}`);
    } catch (e) {
      console.log(`> Failed to remove associated users`, e.message);

      // We want errors to be non-blocking but they are logged
      Sentry.setUser(get(context, 'call.user', null));
      Sentry.captureException(e);
    }

    // search for operator's applications and revoke them
    try {
      for (const { uuid, owner_id } of await this.kernel.call(
        'application:list',
        { owner_id: params._id, owner_service: 'operator' },
        { ...ctx, ...{ call: { user: { permissions: ['application.list'] } } } },
      )) {
        await this.kernel.call(
          'application:revoke',
          { uuid },
          { ...ctx, ...{ call: { user: { operator_id: owner_id, permissions: ['application.revoke'] } } } },
        );
        console.log(`> revoked app:`, { uuid, owner_id });
      }
    } catch (e) {
      console.log(`> Failed to remove associated applications`, e.message);
      Sentry.setUser(get(context, 'call.user', null));
      Sentry.captureException(e);
    }

    return true;
  }
}
