import { LightTripInterface } from '~/core/interfaces/trip/tripInterface';

import { TripRankEnum } from '../../../src/app/core/enums/trip/trip-rank.enum';
import { TripStatusEnum } from '../../../src/app/core/enums/trip/trip-status.enum';
import { operatorStubs } from '../stubs/operator/operator.list';
import { campaignStubs } from '../stubs/campaign/campaign.list';

export class TripGenerator {
  static numberOfTrips = 20;

  static generateTrip(id: number): LightTripInterface {
    const randomClass = Math.floor(Math.random() * Object.keys(TripRankEnum).length);
    const randomStatus = Math.floor(Math.random() * Object.keys(TripStatusEnum).length);
    const randomIncentive = Math.floor(Math.random() * 10);

    const tripId = id % 2 === 0 ? id + 1 : id;

    return {
      trip_id: tripId,
      operator_class: TripRankEnum[Object.keys(TripRankEnum)[randomClass]],
      start_datetime: <any>new Date().toISOString(),
      status: TripStatusEnum[Object.keys(TripStatusEnum)[randomStatus]],
      campaigns_id: [campaignStubs[0]._id, campaignStubs[1]._id],
      start_town: `Lyon (${tripId})`,
      end_town: `Paris (${tripId})`,
      incentives: [
        {
          amount: randomIncentive,
          siret: '123456',
        },
      ],
      operator_id: operatorStubs[0]._id,
      is_driver: id % 2 === 0,
    };
  }

  static generateTrips(): LightTripInterface[] {
    const trips: LightTripInterface[] = [];
    for (let i = 0; i < TripGenerator.numberOfTrips; i = i + 1) {
      trips.push(TripGenerator.generateTrip(i));
    }
    return trips;
  }
}
