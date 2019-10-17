import { JsonRPCResponse } from '~/core/entities/api/jsonRPCResponse';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';

import { expectedPatchedProfiles } from '../../apiValues/expectedProfile';
import { UserGenerator } from '../../generators/user.generator';

export function stubUserList(users) {
  cy.route({
    method: 'POST',
    url: '/rpc?methods=user:list',
    response: (data) =>
      <JsonRPCResponse[]>[
        {
          id: 1568215196898,
          jsonrpc: '2.0',
          result: {
            data: users,
          },
        },
      ],
  }).as('userList');
}
