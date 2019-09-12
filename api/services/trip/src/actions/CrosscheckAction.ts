// tslint:disable:variable-name
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
  service: 'trip',
  method: 'crosscheck',
})
export class CrosscheckAction extends Action {
  public readonly middlewares: (string | [string, any])[] = [['channel.transport', ['queue']]];

  constructor(
    private tripRepository: TripRepositoryProviderInterfaceResolver,
    private kernel: KernelInterfaceResolver,
    private config: ConfigInterfaceResolver,
  ) {
    super();
  }

  public async handle(journey: JourneyInterface, context: ContextType): Promise<TripInterface> {
    // filter 7 days expired journey
    const trip: TripInterface = await this.findTripOrNull(journey);
    let finalTrip: TripInterface;

    this.logger.debug(`Trying to get existing trip for ${journey._id}, found ${trip ? trip._id : 'none'}`);

    if (trip === null) {
      try {
        finalTrip = await this.createTrip(journey);
      } catch (e) {
        throw e;
      }
    } else {
      finalTrip = await this.mergeJourneyWithTrip(journey, trip);
    }

    await this.kernel.notify(
      'trip:dispatch',
      { _id: finalTrip._id },
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

    return finalTrip;
  }

  private async findTripOrNull(journey: JourneyInterface): Promise<TripInterface | null> {
    if ('operator_journey_id' in journey) {
      try {
        const trip = await this.tripRepository.findByOperatorTripIdAndOperatorId({
          operator_trip_id: journey.operator_journey_id,
          operator_id: journey.operator_id,
        });
        return trip;
      } catch (e) {
        return this.guessTrip(journey);
      }
    }
    return this.guessTrip(journey);
  }

  private async guessTrip(journey: JourneyInterface): Promise<TripInterface | null> {
    try {
      const driverPhone = get(journey, 'driver.identity.phone', null);

      if (!driverPhone) {
        throw new Error(`No driver phone in: ${journey.journey_id}`);
      }

      const startTimeRange = {
        min: moment
          .utc(journey.driver.start.datetime)
          .subtract(2, 'h')
          .toDate(),
        max: moment
          .utc(journey.driver.start.datetime)
          .add(2, 'h')
          .toDate(),
      };
      const r = await this.tripRepository.findByPhoneAndTimeRange(driverPhone, startTimeRange);
      return r;
    } catch (e) {
      return null;
    }
  }
  private async createTrip(journey: JourneyInterface): Promise<Trip> {
    const trip = new Trip({
      operator_id: [journey.operator_id],
      operator_trip_id: 'operator_journey_id' in journey ? journey.operator_journey_id : null,
      status: this.config.get('rules.status.pending'),
      territories: this.mapTerritories(journey),
      start: this.reduceStartDate(journey),
      people: [
        {
          ...journey.passenger,
          operator_class: journey.operator_class, // TODO: add operator_class, maybe operator_id
          journey_id: journey.journey_id,
          operator_id: journey.operator_id,
        },
        {
          ...journey.driver,
          operator_class: journey.operator_class,
          journey_id: journey.journey_id,
          operator_id: journey.operator_id,
        },
      ],
      createdAt: new Date(),
    });
    return this.tripRepository.create(trip);
  }

  private async mergeJourneyWithTrip(journey: JourneyInterface, sourceTrip: TripInterface): Promise<Trip> {
    if ('status' in sourceTrip && sourceTrip.status === this.config.get('rules.status.locked')) {
      throw new Error(`Trip ${sourceTrip._id} is locked, impossible to add journey ${journey._id}`);
    }

    // extract existing phone number to compare identities
    const phones = uniq(sourceTrip.people.map((p: PersonInterface) => p.identity.phone));

    // filter mapped people by their phone number. Keep non matching ones
    const people = [journey.passenger, journey.driver].filter(
      (person: PersonInterface) => phones.indexOf(person.identity.phone) === -1,
    );

    // filter mapped territories. Keep non matching ones
    const territory = this.mapTerritories(journey).filter((t: string) => sourceTrip.territories.indexOf(t) === -1);

    // find the oldest start date
    const newStartDate = this.reduceStartDate(journey, sourceTrip);
    const operator_id = uniq([...sourceTrip.operator_id, journey.operator_id]);

    return this.tripRepository.findByIdAndPatch(sourceTrip._id, {
      operator_id,
      people,
      territory,
      start: newStartDate,
      updatedAt: new Date(),
    });
  }

  // find the oldest start date
  private reduceStartDate(journey: JourneyInterface, trip: TripInterface | null = null): Date {
    if (trip) {
      const arr: Date[] = [journey.driver.start.datetime, trip.start];

      return arr.reduce((p, c) => (new Date(p).getTime() < new Date(c).getTime() ? p : c), new Date());
    }

    return journey.driver.start.datetime;
  }

  // get all territories from journey
  private mapTerritories(journey: JourneyInterface): string[] {
    const territories: string[] = [];

    if ('driver' in journey) {
      territories.push(journey.driver.start.territory);
      territories.push(journey.driver.end.territory);
    }
    if ('passenger' in journey) {
      territories.push(journey.driver.start.territory);
      territories.push(journey.driver.end.territory);
    }

    return uniq(territories);
  }
}
