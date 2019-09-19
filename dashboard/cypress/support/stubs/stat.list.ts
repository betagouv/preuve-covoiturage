import { JsonRPCResponse } from '../../../src/app/core/entities/api/jsonRPCResponse';

export function stubStatList() {
  cy.route({
    method: 'POST',
    url: '/rpc?methods=trip:stats',
    response: (data) =>
      <JsonRPCResponse[]>[
        {
          id: 1568215196898,
          jsonrpc: '2.0',
          result: {
            data: [],
          },
        },
      ],
  });
}
