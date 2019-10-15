import { Trip } from '../../../src/app/core/entities/trip/trip';
import { TripRankEnum } from '../../../src/app/core/enums/trip/trip-rank.enum';
import { TripStatusEnum } from '../../../src/app/core/enums/trip/trip-status.enum';
import { TripInterface } from '../../../src/app/core/interfaces/trip/tripInterface';

import { operatorStubs } from '../stubs/operator/operator.list';

export class TripGenerator {
  generateTrip(): Trip {
    const randomClass = Math.floor(Math.random() * Object.keys(TripRankEnum).length);
    const randomStatus = Math.floor(Math.random() * Object.keys(TripStatusEnum).length);

    const tripToReturn: TripInterface = {
      trip_id: 8276,
      operator_class: TripRankEnum[Object.keys(TripRankEnum)[randomClass]],
      start_datetime: new Date().toISOString(),
      status: TripStatusEnum[Object.keys(TripStatusEnum)[randomStatus]],
      campaigns_id: [],
      start_town: 'Coupvray',
      end_town: 'Magny-le-Hongre',
      incentives: [],
      operator_id: operatorStubs[0]._id,
    };

    return new Trip(tripToReturn);
  }
}
