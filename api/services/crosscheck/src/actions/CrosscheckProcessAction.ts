import { Parents, Container, Types, Interfaces } from '@ilos/core';
import * as _ from 'lodash';
import moment from 'moment';

import {Person, Trip} from '../entities/trip';
import {CrosscheckRepositoryProviderInterfaceResolver} from '../interfaces/repository/CrosscheckRepositoryProviderInterface';
import {PersonInterface, TripInterface} from '../interfaces/TripInterface';
import {JourneyInterface} from '../interfaces/JourneyInterface';

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
  constructor(
    private crosscheckRepository: CrosscheckRepositoryProviderInterfaceResolver,

  ) {
    super();
  }

  public async handle(param: CrosscheckProcessParamsInterface, context: Types.ContextType): Promise<Trip> {


    let trip: TripInterface | null;

    // find by ( operator_journey_id & operator._id )
    try {
      trip = await this.crosscheckRepository.findByOperatorJourneyIdAndOperatorId({
        operator_journey_id: param.journey.operator_journey_id,
        operator_id: param.journey.operator._id,
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

    if (!trip) {
      this.createFromJourney(param.journey);
    } else {
      this.addJourney(param.journey, trip);
    }

    return trip;
  }

  private async createFromJourney(journey: JourneyInterface): Promise<Trip> {
    const trip = new Trip({
      operator_id: journey.operator._id,
      operator_journey_id: journey.operator_journey_id,
      status: 'pending',
      territory: journey.territory,
      start: this.reduceStartDate(journey),
      people: this.mapPeople(journey),
    });

    // await Journey.findByIdAndUpdate({ _id: journey._id }, { trip_id: trip._id });

    return trip;
  }

  public async addJourney(journey: JourneyInterface, sourceTrip: TripInterface): Promise<Trip> {
    // extract existing phone number to compare identities
    const phones = _.uniq(sourceTrip.people.map((p: PersonInterface) => p.identity.phone));

    // filter mapped people by their phone number. Keep non matching ones
    const people = this.mapPeople(journey).filter(
      (person:PersonInterface) => phones.indexOf(person.identity.phone) === -1,
    );

    const newStartDate = this.reduceStartDate(journey, sourceTrip);

    return this.crosscheckRepository.findByIdAndPushPeople(sourceTrip._id, people, newStartDate);

    // await Journey.findByIdAndUpdate({ _id: journey._id }, { trip_id: trip._id });
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
          class: journey.operator_class,
          operator_class: journey.operator_class,
          operator: journey.operator,
          territory: journey.territory,
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
          operator_class: journey.operator_class,
          operator: journey.operator,
          territory: journey.territory,
          is_driver: false,
          ...passenger,
        }),
      );
    }

    return people;
  }

  // find the oldest start date
  private reduceStartDate(journey: JourneyInterface, trip: TripInterface | null = null): Date {
    const arr: Date[] = [journey.driver.start.datetime];

    if (trip) {
      arr.push(trip.start);
    }

    return arr.reduce((p, c) => (p.getTime() < c.getTime() ? p : c), new Date());
  }

}
