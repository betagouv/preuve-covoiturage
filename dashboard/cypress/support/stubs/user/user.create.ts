import { JsonRPCResponse } from '~/core/entities/api/jsonRPCResponse';
import { Groups } from '~/core/enums/user/groups';

import { expectedPatchedProfiles } from '../../expectedApiPayload/expectedProfile';
import { expectedNewUsers } from '../../expectedApiPayload/expectedUser';

export function stubUserCreate(group: Groups) {
  cy.route({
    method: 'POST',
    url: '/rpc?methods=user:create',
    response: (data) =>
      <JsonRPCResponse[]>[
        {
          id: 1568215196898,
          jsonrpc: '2.0',
          result: {
            data: {
              ...expectedNewUsers[group],
            },
          },
        },
      ],
  }).as('userCreate');
}
