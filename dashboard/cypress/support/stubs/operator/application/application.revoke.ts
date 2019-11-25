import { JsonRPCResponse } from '~/core/entities/api/jsonRPCResponse';

import { expectedPatchedOperator } from '../../../expectedApiPayload/expectedOperator';

export function stubApplicationRevoke() {
  cy.route({
    method: 'POST',
    url: '/rpc?methods=application:revoke',
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
  }).as('applicationRevoke');
}
