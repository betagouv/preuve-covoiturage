import { JsonRPCResponse } from '~/core/entities/api/jsonRPCResponse';

import { expectedPatchedOperator } from '../../expectedApiPayload/expectedOperator';

export function stubOperatorPatchContacts() {
  cy.route({
    method: 'POST',
    url: '/rpc?methods=operator:patchContacts',
    response: (data) =>
      <JsonRPCResponse[]>[
        {
          id: 1568215196898,
          jsonrpc: '2.0',
          result: {
            data: {
              ...expectedPatchedOperator,
            },
          },
        },
      ],
  }).as('operatorPatchContacts');
}
