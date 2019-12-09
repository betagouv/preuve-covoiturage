import { JsonRPCResponse } from '~/core/entities/api/jsonRPCResponse';

import { expectedPatchedTerritory } from '../../expectedApiPayload/expectedTerritory';

export function stubTerritoryPatchContacts() {
  cy.route({
    method: 'POST',
    url: '/rpc?methods=territory:patchContacts',
    response: (data) =>
      <JsonRPCResponse[]>[
        {
          id: 1568215196898,
          jsonrpc: '2.0',
          result: {
            data: {
              ...expectedPatchedTerritory,
            },
          },
        },
      ],
  }).as('territoryPatchContacts');
}
