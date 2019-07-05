import { Parents, Container, Types, Interfaces, Exceptions } from '@ilos/core';
import * as _ from 'lodash';
import moment from 'moment';

import { Person, Trip } from '../entities/Trip';
import { CrosscheckRepositoryProviderInterfaceResolver } from '../interfaces/repository/CrosscheckRepositoryProviderInterface';
import { PersonInterface, TripInterface } from '../interfaces/TripInterface';
import { JourneyInterface } from '../interfaces/JourneyInterface';

interface CrosscheckProcessParamsInterface {
  journey: JourneyInterface;
}

/*
 * Build trip by connecting journeys by operator_id & operator_journey_id | driver phone & start time
 */
@Container.handler({
  service: 'crosscheck',
  method: 'process',
})
export class CrosscheckProcessAction extends Parents.Action {
  public readonly middlewares: (string | [string, any])[] = [['validate', 'crosscheck.process']];
  constructor(private crosscheckRepository: CrosscheckRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(param: CrosscheckProcessParamsInterface, context: Types.ContextType): Promise<Trip> {
    let trip: TripInterface | null;

    // find by ( operator_journey_id & operator_id )
    try {
      trip = await this.crosscheckRepository.findByOperatorJourneyIdAndOperatorId({
        operator_journey_id: param.journey.operator_journey_id,
        operator_id: param.journey.operator_id,
      });
    } catch (e) {
      //
    }

    // find by ( driver phone & start time range )
    try {
      const driverPhone = _.get(param.journey, 'driver.identity.phone', null);
      const startTimeRange = {
        min: moment
          .utc(param.journey.driver.start.datetime)
          .subtract(2, 'h')
          .toDate(),
        max: moment
          .utc(param.journey.driver.start.datetime)
          .add(2, 'h')
          .toDate(),
      };
      trip = await this.crosscheckRepository.findByPhoneAndTimeRange(driverPhone, startTimeRange);
    } catch (e) {
      //
    }

    trip = !trip
      ? await this.createTripFromJourney(param.journey)
      : await this.consolidateTripWithJourney(param.journey, trip);

    return trip;
  }

  private async createTripFromJourney(journey: JourneyInterface): Promise<Trip> {
    const trip = new Trip({
      status: 'pending',
      territory: this.mapTerritories(journey),
      start: this.reduceStartDate(journey),
      people: this.mapPeople(journey),
    });
    return this.crosscheckRepository.create(trip);
  }

  private async consolidateTripWithJourney(journey: JourneyInterface, sourceTrip: TripInterface): Promise<Trip> {
    // extract existing phone number to compare identities
    const phones = _.uniq(sourceTrip.people.map((p: PersonInterface) => p.identity.phone));

    // filter mapped people by their phone number. Keep non matching ones
    const people = this.mapPeople(journey).filter(
      (person: PersonInterface) => phones.indexOf(person.identity.phone) === -1,
    );

    // filter mapped territories. Keep non matching ones
    const territories = this.mapTerritories(journey).filter(
      (territory: string) => sourceTrip.territory.indexOf(territory) === -1,
    );

    // find the oldest start date
    const newStartDate = this.reduceStartDate(journey, sourceTrip);

    return this.crosscheckRepository.findByIdAndPushPeople(sourceTrip._id, people, territories, newStartDate);
  }

  /*
   * map people from journey
   */
  private mapPeople(journey: JourneyInterface): Person[] {
    const people: Person[] = [];
    if ('driver' in journey) {
      const driver = journey.driver;
      people.push(
        new Person({
          journey_id: journey.journey_id,
          operator_journey_id: journey.operator_journey_id,
          operator_class: journey.operator_class,
          operator_id: journey.operator_id,
          class: journey.operator_class,
          is_driver: true,
          ...driver,
        }),
      );
    }
    if ('passenger' in journey) {
      const passenger = journey.passenger;
      people.push(
        new Person({
          journey_id: journey.journey_id,
          class: journey.operator_class,
          operator_journey_id: journey.operator_journey_id,
          operator_class: journey.operator_class,
          operator_id: journey.operator_id,
          is_driver: false,
          ...passenger,
        }),
      );
    }

    return people;
  }

  // find the oldest start date
  private reduceStartDate(journey: JourneyInterface, trip: TripInterface | null = null): Date {
    if (trip) {
      const arr: Date[] = [journey.driver.start.datetime, trip.start];
      return arr.reduce((p, c) => (new Date(p).getTime() < new Date(c).getTime() ? p : c), new Date());
    }
    return journey.driver.start.datetime;
  }

  // recuperate all territories from journey
  private mapTerritories(journey: JourneyInterface): string[] {
    let territories: string[] = [];
    if ('driver' in journey) {
      territories = territories.concat(journey.driver.start.territory);
      territories = territories.concat(journey.driver.end.territory);
    }
    if ('passenger' in journey) {
      territories = territories.concat(journey.driver.start.territory);
      territories = territories.concat(journey.driver.end.territory);
    }

    return _.uniq(territories);
  }
}
