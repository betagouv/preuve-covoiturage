import { JsonRPCResponse } from '~/core/entities/api/jsonRPCResponse';

import { ExpectedVisibility } from '../../expectedApiPayload/expectedVisibility';

export function stubVisibilityUpdate() {
  cy.route({
    method: 'POST',
    url: '/rpc?methods=operator:updateVisibleInTerritories',
    response: (data) =>
      <JsonRPCResponse[]>[
        {
          id: 1568215196898,
          jsonrpc: '2.0',
          result: {
            data: ExpectedVisibility.get(),
          },
        },
      ],
  }).as('updateVisibleInTerritories');
}
