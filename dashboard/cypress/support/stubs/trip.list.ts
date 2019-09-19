import { JsonRPCResponse } from '../../../src/app/core/entities/api/jsonRPCResponse';
import { Trip } from '../../../src/app/core/entities/trip/trip';

import { TripGenerator } from '../generators/trips.generator';

export function stubTripList() {
  const tripGenerator = new TripGenerator();
  const trips: Trip[] = [];
  for (let i = 0; i < 20; i = i + 1) {
    trips.push(tripGenerator.generateTrip());
  }
  cy.route({
    method: 'POST',
    url: '/rpc?methods=trip:list',
    response: (data) =>
      <JsonRPCResponse[]>[
        {
          id: 1568215196898,
          jsonrpc: '2.0',
          result: {
            data: trips,
          },
        },
      ],
  }).as('tripList');
}
