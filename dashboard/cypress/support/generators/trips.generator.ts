import { Person } from '../../../src/app/core/entities/trip/person';
import { IncentiveUnitEnum } from '../../../src/app/core/enums/campaign/incentive-unit.enum';
import { Trip } from '../../../src/app/core/entities/trip/trip';
import { TripRankEnum } from '../../../src/app/core/enums/trip/trip-rank.enum';
import { TripStatusEnum } from '../../../src/app/core/enums/trip/trip-status.enum';
import { TripInterface } from '../../../src/app/core/interfaces/trip/tripInterface';

import { campaignStubs } from '../stubs/campaign.list';

export class TripGenerator {
  generateTrip(): Trip {
    const randomClass = Math.floor(Math.random() * Object.keys(TripRankEnum).length);
    const randomStatus = Math.floor(Math.random() * Object.keys(TripStatusEnum).length);

    const tripToReturn: TripInterface = {
      _id: 'AZFAFZAF34345345',
      class: TripRankEnum[Object.keys(TripRankEnum)[randomClass]],
      start: new Date(),
      status: TripStatusEnum[Object.keys(TripStatusEnum)[randomStatus]],
      campaigns: [],
      people: [],
    };

    const nbPeople = Math.floor(Math.random() * 5);
    for (let i = 0; i <= nbPeople; i = i + 1) {
      this.generatePeople(tripToReturn, i);
    }

    const nbCampaigns = Math.floor(Math.random() * 10);
    tripToReturn.campaigns = tripToReturn.campaigns.concat([...campaignStubs].splice(0, nbCampaigns));

    return new Trip(tripToReturn);
  }

  generatePeople(trip: Trip, i: number): void {
    trip.people.push(
      new Person({
        rank: TripRankEnum.A,
        operator_id: '',
        is_driver: i === 0,
        start_town: 'Metropolis',
        end_town: 'Gotham city',
        incentives: [
          {
            amount: Math.floor(Math.random() * 10),
            amount_unit: [IncentiveUnitEnum.EUR, IncentiveUnitEnum.POINT][Math.floor(Math.random() * 2)],
          },
        ],
      }),
    );
  }
}
