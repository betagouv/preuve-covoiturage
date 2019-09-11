import { Trip } from '../../../src/app/core/entities/trip/trip';
import { TripGenerator } from '../generators/trips.generator';

export function stubTripList() {
  cy.route({
    method: 'POST',
    url: '/api?methods=trip.list',
    response: (data) => {
      const tripGenerator = new TripGenerator();
      const trips: Trip[] = [];
      for (let i = 0; i < 20; i = i + 1) {
        trips.push(tripGenerator.generateTrip());
      }
      return trips;
    },
  });
}
