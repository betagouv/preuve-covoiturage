// tslint:disable:variable-name
import { Action } from '@ilos/core';
import { handler, ContextType, KernelInterfaceResolver, ConfigInterfaceResolver } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/carpool/crosscheck.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { CarpoolRepositoryProviderInterfaceResolver } from '../interfaces/CarpoolRepositoryProviderInterface';

/*
 * Import journey in carpool database
 */
@handler(handlerConfig)
export class CrosscheckAction extends Action {
  public readonly middlewares: ActionMiddleware[] = [['channel.service.only', ['acquisition', 'normalization', handlerConfig.service]]];

  constructor(
    private kernel: KernelInterfaceResolver,
    private config: ConfigInterfaceResolver,
    private pg: CarpoolRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(journey: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    this.logger.debug(`${handlerConfig.service}:${handlerConfig.method}`, journey._id);

    // TODO: add schema
    await this.pg.importJourney(journey);

    // save payment & declared incentives
    let delay = this.config.get('rules.maxAge');

    if (journey.driver && journey.driver.start && journey.driver.start.datetime) {
      delay -= new Date().valueOf() - journey.driver.start.datetime.valueOf();
    }

    await this.kernel.notify(
      'carpool:dispatch',
      { acquisition_id: journey.journey_id },
      {
        channel: {
          service: handlerConfig.service,
          metadata: {
            delay,
          },
        },
        call: {
          user: {},
        },
      },
    );

    return;
  }
}
