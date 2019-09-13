// tslint:disable:variable-name
import { get, uniq } from 'lodash';
import moment from 'moment';

import { Action } from '@ilos/core';
import { handler, ContextType, KernelInterfaceResolver, ConfigInterfaceResolver } from '@ilos/common';
import { JourneyInterface, TripInterface, PersonInterface } from '@pdc/provider-schema';

import { TripRepositoryProviderInterfaceResolver } from '../interfaces/TripRepositoryProviderInterface';
import { Trip } from '../entities/Trip';
import { Person } from '../entities/Person';
import { TripPgRepositoryProvider } from '../providers/TripPgRepositoryProvider';

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
    private pg: TripPgRepositoryProvider,
  ) {
    super();
  }

  public async handle(journey: JourneyInterface, context: ContextType): Promise<void> {
    const trip = await this.pg.findOrCreateTripForJourney({
      ...journey,
    });

    await this.kernel.notify(
      'trip:dispatch',
      { _id: trip._id },
      {
        channel: {
          service: 'trip',
          metadata: {
            delay: this.config.get('rules.maxAge'),
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
