// tslint:disable:variable-name
import { Action } from '@ilos/core';
import { handler, ContextType, KernelInterfaceResolver, ConfigInterfaceResolver } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/trip/crosscheck.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { TripPgRepositoryProviderInterfaceResolver } from '../interfaces';

/*
 * Build trip by connecting journeys by operator_id & operator_journey_id | driver phone & start time
 */
@handler(handlerConfig)
export class CrosscheckAction extends Action {
  public readonly middlewares: ActionMiddleware[] = [['channel.transport', ['queue']]];

  constructor(
    private kernel: KernelInterfaceResolver,
    private config: ConfigInterfaceResolver,
    private pg: TripPgRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(journey: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    this.logger.debug('trip:crosscheck', journey._id);

    // TODO: add schema
    const [created, trip] = await this.pg.findOrCreateTripForJourney({ ...journey.payload });

    // save payment & declared incentives

    if (created) {
      let delay = this.config.get('rules.maxAge');

      if (journey.payload.driver && journey.payload.driver.start && journey.payload.driver.start.datetime) {
        delay -= new Date().valueOf() - journey.payload.driver.start.datetime.valueOf();
      }

      await this.kernel.notify(
        'trip:dispatch',
        { _id: trip._id },
        {
          channel: {
            service: 'trip',
            metadata: {
              delay,
            },
          },
          call: {
            user: {},
          },
        },
      );
    }

    return;
  }
}
