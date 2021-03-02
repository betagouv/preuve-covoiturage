import { Groups } from '~/core/enums/user/groups';
import { JsonRPCResponse } from '~/core/entities/api/jsonRPCResponse';

export function stubLogout() {
  cy.route({
    method: 'POST',
    url: '/logout',
    response: (data) =>
      <JsonRPCResponse>{
        id: 1,
        jsonrpc: '2.0',
        result: {
          data: null,
        },
      },
  });
}
