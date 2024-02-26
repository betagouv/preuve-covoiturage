import { get } from 'lodash';
import { ContextType, handler, KernelInterfaceResolver } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { Sentry } from '@pdc/provider-sentry';
import { hasPermissionMiddleware } from '@pdc/provider-middleware';

import { OperatorRepositoryProviderInterfaceResolver } from '../interfaces/OperatorRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '@shared/operator/delete.contract';
import { alias } from '@shared/operator/delete.schema';

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware('registry.operator.delete'), ['validate', alias]],
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
      console.debug(`> deleted associated users to operator ${params._id}`);
    } catch (e) {
      console.error(`> Failed to remove associated users`, e);

      // We want errors to be non-blocking but they are logged
      Sentry.setUser(get(context, 'call.user', null));
      Sentry.captureException(e);
    }

    // search for operator's applications and revoke them
    try {
      for (const { uuid, owner_id } of await this.kernel.call(
        'application:list',
        { owner_id: params._id, owner_service: 'operator' },
        {
          ...ctx,
          ...{
            call: {
              user: {
                operator_id: params._id,
                permissions: ['operator.application.list'],
              },
            },
          },
        },
      )) {
        await this.kernel.call(
          'application:revoke',
          { uuid },
          { ...ctx, ...{ call: { user: { operator_id: owner_id, permissions: ['operator.application.revoke'] } } } },
        );
        console.debug(`> revoked app:`, { uuid, owner_id });
      }
    } catch (e) {
      console.error(`> Failed to remove associated applications`, e);
      Sentry.setUser(get(context, 'call.user', null));
      Sentry.captureException(e);
    }

    return true;
  }
}
