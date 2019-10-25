import { Action } from '@ilos/core';
import { handler, ContextType, KernelInterfaceResolver, ConfigInterfaceResolver } from '@ilos/common';

import { TripRepositoryProviderInterfaceResolver } from '../interfaces/TripRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/trip/dispatch.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';

/*
 * Build trip by connecting journeys by operator_id & operator_journey_id | driver phone & start time
 */
@handler(handlerConfig)
export class DispatchAction extends Action {
  public readonly middlewares: ActionMiddleware[] = [['channel.transport', ['queue']]];

  constructor(
    private tripRepository: TripRepositoryProviderInterfaceResolver,
    private kernel: KernelInterfaceResolver,
    private config: ConfigInterfaceResolver,
  ) {
    super();
  }

  public async handle(request: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const trip = await this.tripRepository.findByIdAndPatch(request._id, {
      status: this.config.get('rules.status.locked'),
    });

    // dispatch to
    // - stats
    // - fraudcheck
    // - policy

    // this.kernel.notify('')

    return;
  }
}
