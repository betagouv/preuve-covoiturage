import { Trip } from '../../../src/app/core/entities/trip/trip';
import { TripClassEnum } from '../../../src/app/core/enums/trip/trip-class.enum';
import { TripStatusEnum } from '../../../src/app/core/enums/trip/trip-status.enum';
import { TripInterface } from '../../../src/app/core/interfaces/trip/tripInterface';
import { campaignStubs } from '../stubs/campaign.list';

export class TripGenerator {
  generateTrip(): Trip {
    const randomClass = Math.floor(Math.random() * Object.keys(TripClassEnum).length);
    const randomStatus = Math.floor(Math.random() * Object.keys(TripStatusEnum).length);

    const tripToReturn: TripInterface = {
      _id: 'AZFAFZAF34345345',
      class: TripClassEnum[Object.keys(TripClassEnum)[randomClass]],
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

  generatePeople(trip, i) {
    trip.people.push({
      class: TripClassEnum.A,
      operator: {
        _id: '1',
        nom_commercial: 'Batcovoit 🦇',
      },
      is_driver: i === 0,
      start: 'Metropolis',
      end: 'Gotham city',
      incentives: [
        {
          amount: Math.floor(Math.random() * 10),
          amount_unit: ['eur', 'point'][Math.floor(Math.random() * 2)],
        },
      ],
    });
  }
}
