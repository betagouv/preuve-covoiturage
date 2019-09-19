import { UserGroupEnum } from '../../../src/app/core/enums/user/user-group.enum';
import { JsonRPCResponse } from '../../../src/app/core/entities/api/jsonRPCResponse';

import { cypress_logging_users } from './login';

export function stubUserMe(type: UserGroupEnum) {
  cy.route({
    method: 'POST',
    url: '/rpc?methods=user:me',
    response: (data) =>
      <JsonRPCResponse[]>[
        {
          id: 1568215196898,
          jsonrpc: '2.0',
          result: {
            data: cypress_logging_users[type],
          },
        },
      ],
  });
}
