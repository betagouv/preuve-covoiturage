import { JsonRPCResponse } from '~/core/entities/api/jsonRPCResponse';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';

import { expectedPatchedProfiles } from '../../expectedApiPayload/expectedProfile';

export function stubUserPatch(group: UserGroupEnum) {
  cy.route({
    method: 'POST',
    url: '/rpc?methods=user:patch',
    response: (data) =>
      <JsonRPCResponse[]>[
        {
          id: 1568215196898,
          jsonrpc: '2.0',
          result: {
            data: {
              ...expectedPatchedProfiles[group],
            },
          },
        },
      ],
  }).as('userPatch');
}
