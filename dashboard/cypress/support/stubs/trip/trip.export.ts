import { JsonRPCResponse } from '~/core/entities/api/jsonRPCResponse';

export function stubTripExport() {
  cy.route({
    method: 'POST',
    url: '/rpc?methods=trip:export',
    response: (data) =>
      <JsonRPCResponse[]>[
        {
          id: 1568215196898,
          jsonrpc: '2.0',
          result: {
            data: true,
          },
        },
      ],
  }).as('tripExport');
}
