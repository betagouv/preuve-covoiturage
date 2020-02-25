import { Action } from '@ilos/core';
import { handler, ContextType, KernelInterfaceResolver, ConfigInterfaceResolver } from '@ilos/common';

import { CarpoolRepositoryProviderInterfaceResolver } from '../interfaces/CarpoolRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/carpool/dispatch.contract';

/*
 * Dispatch carpool to other service when ready
 */
@handler({
  ...handlerConfig,
  middlewares: [['channel.service.only', ['acquisition', 'normalization', handlerConfig.service]]],
})
export class DispatchAction extends Action {
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
