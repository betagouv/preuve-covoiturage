import { Action } from '@ilos/core';
import { handler, ContextType, KernelInterfaceResolver, ConfigInterfaceResolver } from '@ilos/common';

import { CarpoolRepositoryProviderInterfaceResolver } from '../interfaces/CarpoolRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/carpool/dispatch.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';

/*
 * Dispatch carpool to other service when ready
 */
@handler(handlerConfig)
export class DispatchAction extends Action {
  public readonly middlewares: ActionMiddleware[] = [['channel.service.only', ['acquisition', 'normalization', handlerConfig.service]]];

  constructor(
    private tripRepository: CarpoolRepositoryProviderInterfaceResolver,
    private kernel: KernelInterfaceResolver,
    private config: ConfigInterfaceResolver,
  ) {
    super();
  }

  public async handle(request: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    // const trip = await this.tripRepository.findByIdAndPatch(request._id, {
    //   status: this.config.get('rules.status.locked'),
    // });

    // dispatch to
    // - stats
    // - fraudcheck
    // - policy

    // this.kernel.notify('')

    return;
  }
}
