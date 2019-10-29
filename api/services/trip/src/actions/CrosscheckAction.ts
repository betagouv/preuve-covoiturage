// tslint:disable:variable-name
import { get, uniq } from 'lodash';
import moment from 'moment';

import { Action } from '@ilos/core';
import { handler, ContextType, KernelInterfaceResolver, ConfigInterfaceResolver } from '@ilos/common';
import { JourneyInterface } from '@pdc/provider-schema';

import { TripPgRepositoryProviderInterfaceResolver } from '../interfaces';

/*
 * Build trip by connecting journeys by operator_id & operator_journey_id | driver phone & start time
 */
@handler({
  service: 'trip',
  method: 'crosscheck',
})
export class CrosscheckAction extends Action {
  public readonly middlewares: (string | [string, any])[] = [['channel.transport', ['queue']]];

  constructor(
    private kernel: KernelInterfaceResolver,
    private config: ConfigInterfaceResolver,
    private pg: TripPgRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(journey: JourneyInterface, context: ContextType): Promise<void> {
    this.logger.debug('trip:crosscheck', journey._id);

    // TODO: add schema
    const [created, trip] = await this.pg.findOrCreateTripForJourney({
      ...journey,
    });

    if (created) {
      let delay = this.config.get('rules.maxAge');

      if (journey.driver && journey.driver.start && journey.driver.start.datetime) {
        delay -= new Date().valueOf() - journey.driver.start.datetime.valueOf();
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
