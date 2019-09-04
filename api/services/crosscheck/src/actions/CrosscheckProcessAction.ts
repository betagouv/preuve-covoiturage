import { get, uniq } from 'lodash';
import moment from 'moment';

import { Action } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';
import { JourneyInterface, TripInterface, PersonInterface } from '@pdc/provider-schema';

import { TripRepositoryProviderInterfaceResolver } from '../interfaces/TripRepositoryProviderInterface';
import { Trip } from '../entities/Trip';
import { Person } from '../entities/Person';

/*
 * Build trip by connecting journeys by operator_id & operator_journey_id | driver phone & start time
 */
@handler({
  service: 'crosscheck',
  method: 'process',
})
export class CrosscheckProcessAction extends Action {
  // public readonly middlewares: (string | [string, any])[] = [['validate', 'crosscheck.process']];
  // TODO: middlewares
  // TODO : 5 days
  constructor(private crosscheckRepository: TripRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(journey: JourneyInterface, context: ContextType): Promise<TripInterface> {
    const trip: TripInterface = await this.findTripOrNull(journey);
    if (trip === null) {
      try {
        const t = await this.createTrip(journey);
        return t;
      } catch (e) {
        throw e;
      }
    }
    return this.mergeJourneyWithTrip(journey, trip);
  }

  private async findTripOrNull(journey: JourneyInterface): Promise<TripInterface | null> {
    if ('operator_journey_id' in journey) {
      try {
        return this.crosscheckRepository.findByOperatorJourneyId({
          operator_journey_id: journey.operator_journey_id,
          operator_id: journey.operator_id,
        });
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
      const r = await this.crosscheckRepository.findByPhoneAndTimeRange(driverPhone, startTimeRange);
      return r;
    } catch (e) {
      return null;
    }
  }
  private async createTrip(journey: JourneyInterface): Promise<Trip> {
    const trip = new Trip({
      status: 'pending',
      territories: this.mapTerritories(journey),
      start: this.reduceStartDate(journey),
      people: [journey.passenger, journey.driver],
      createdAt: new Date(),
    });
    return this.crosscheckRepository.create(trip);
  }

  private async mergeJourneyWithTrip(journey: JourneyInterface, sourceTrip: TripInterface): Promise<Trip> {
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

    return this.crosscheckRepository.findByIdAndPatch(sourceTrip._id, {
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
