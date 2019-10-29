import { JsonRPCResponse } from '~/core/entities/api/jsonRPCResponse';

import { CypressExpectedCampaign } from '../../apiValues/expectedCampaign';

export function stubCampaignLaunch() {
  cy.route({
    method: 'POST',
    url: '/rpc?methods=campaign:launch',
    response: (data) =>
      <JsonRPCResponse[]>[
        {
          id: 1568215196898,
          jsonrpc: '2.0',
          result: {
            data: {
              ...CypressExpectedCampaign.getLaunched(),
            },
          },
        },
      ],
  }).as('campaignLaunch');
}
