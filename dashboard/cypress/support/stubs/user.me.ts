import { UserGroupEnum } from '~/core/enums/user/user-group.enum';

import { cypress_logging_users } from './login';

export function stubUserMe(type: UserGroupEnum) {
  cy.route({
    method: 'POST',
    url: '/rpc?methods=user:me',
    response: (data) => ({
      payload: {
        data: [
          {
            id: 1568215196898,
            jsonrpc: '2.0',
            result: cypress_logging_users[type],
          },
        ],
      },
    }),
  });
}
