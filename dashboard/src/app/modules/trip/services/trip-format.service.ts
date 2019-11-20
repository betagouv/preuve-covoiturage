import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as moment from 'moment';
import * as _ from 'lodash';

import { JsonRPCService } from '~/core/services/api/json-rpc.service';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { CoupleInterface } from '~/core/interfaces/trip/tripInterface';
import { LightTrip } from '~/core/entities/trip/trip';

@Injectable({
  providedIn: 'root',
})
export class TripFormatService {
  constructor(
    private _http: HttpClient,
    private _jsonRPC: JsonRPCService,
    private _authService: AuthenticationService,
  ) {}

  toCouple(lightTrips: LightTrip[]): CoupleInterface[] {
    // get data of passengers
    const passengers = lightTrips
      .filter((lightTrip) => !lightTrip.is_driver)
      .map((lightTrip) => ({
        status: lightTrip.status,
        trip_id: lightTrip.trip_id,
        start_town: lightTrip.start_town,
        start_datetime: moment(lightTrip.start_datetime),
        operator_class: lightTrip.operator_class,
        operator_id: lightTrip.operator_id,
        end_town: lightTrip.end_town,
        incentives: {
          passenger: lightTrip.incentives,
        },
        campaigns_id: lightTrip.campaigns_id,
      }));

    // get data of drivers
    const drivers = lightTrips
      .filter((lightTrip) => lightTrip.is_driver)
      .map((lightTrip) => ({
        status: lightTrip.status,
        trip_id: lightTrip.trip_id,
        start_town: lightTrip.start_town,
        start_datetime: moment(lightTrip.start_datetime),
        operator_class: lightTrip.operator_class,
        operator_id: lightTrip.operator_id,
        end_town: lightTrip.end_town,
        incentives: {
          driver: lightTrip.incentives,
        },
        campaigns_id: lightTrip.campaigns_id,
      }));

    // unit the couples
    const couples: CoupleInterface[] = passengers.map((passenger) => {
      const foundDriver = drivers.filter((driver) => driver.trip_id === passenger.trip_id)[0];
      if (foundDriver) {
        console.log({ foundDriver });
        const campaignIds = _.uniq([...passenger.campaigns_id, ...foundDriver.campaigns_id]);
        return {
          ...passenger,
          incentives: {
            ...passenger.incentives,
            ...foundDriver.incentives,
          },
          campaigns_id: campaignIds,
        };
      }
      return passenger;
    });

    // if driver is single add him as if he were a couple
    const singleDrivers = drivers.filter(
      (driver) => couples.filter((couple) => driver.trip_id === couple.trip_id).length === 0,
    );
    couples.push(...singleDrivers);

    // order by start date DESC
    return couples.sort((a, b) => (a.start_datetime.isAfter(b.start_datetime) ? 1 : 0));
  }
}
