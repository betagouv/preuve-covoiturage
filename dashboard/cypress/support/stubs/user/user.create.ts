import { JsonRPCResponse } from '~/core/entities/api/jsonRPCResponse';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';

import { expectedPatchedProfiles } from '../../expectedApiPayload/expectedProfile';
import { expectedNewUsers } from '../../expectedApiPayload/expectedUser';

export function stubUserCreate(group: UserGroupEnum) {
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
