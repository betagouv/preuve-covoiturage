import { JsonRPCResponse } from '~/core/entities/api/jsonRPCResponse';

export function stubTripList(trips) {
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
