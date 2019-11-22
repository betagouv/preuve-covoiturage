import { JsonRPCResponse } from '~/core/entities/api/jsonRPCResponse';

import { expectedPatchedOperator } from '../../../expectedApiPayload/expectedOperator';

export function stubApplications(applications) {
  cy.route({
    method: 'POST',
    url: '/rpc?methods=application:list',
    response: (data) =>
      <JsonRPCResponse[]>[
        {
          id: 1568215196898,
          jsonrpc: '2.0',
          result: {
            data: applications,
          },
        },
      ],
  }).as('applicationList');
}
