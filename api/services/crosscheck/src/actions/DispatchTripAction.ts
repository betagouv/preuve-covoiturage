import { get, uniq } from 'lodash';
import moment from 'moment';

import { Action } from '@ilos/core';
import { handler, ContextType, KernelInterfaceResolver, ConfigInterfaceResolver } from '@ilos/common';
import { JourneyInterface, TripInterface, PersonInterface } from '@pdc/provider-schema';

import { TripRepositoryProviderInterfaceResolver } from '../interfaces/TripRepositoryProviderInterface';
import { Trip } from '../entities/Trip';
import { Person } from '../entities/Person';

/*
 * Build trip by connecting journeys by operator_id & operator_journey_id | driver phone & start time
 */
@handler({
  service: 'crosscheck',
  method: 'dispatch',
})
export class DispatchTripAction extends Action {
  public readonly middlewares: (string | [string, any])[] = [['channel.transport', ['queue']]];

  constructor(
    private tripRepository: TripRepositoryProviderInterfaceResolver,
    private kernel: KernelInterfaceResolver,
    private config: ConfigInterfaceResolver,
  ) {
    super();
  }

  public async handle(request: { _id: string }, context: ContextType): Promise<void> {
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
