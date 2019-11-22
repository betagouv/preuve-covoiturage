import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';
import { JsonRPCResponse } from '~/core/entities/api/jsonRPCResponse';

import { Campaign } from '~/core/entities/campaign/api-format/campaign';
import { CypressExpectedCampaign } from '../../expectedApiPayload/expectedCampaign';

export function stubCampaignCreate(status: CampaignStatusEnum) {
  cy.route({
    method: 'POST',
    url: '/rpc?methods=campaign:create',
    response: (data) =>
      <JsonRPCResponse[]>[
        {
          id: 1568215196898,
          jsonrpc: '2.0',
          result: {
            data: {
              ...CypressExpectedCampaign.getAfterCreate(),
              status,
            },
          },
        },
      ],
  }).as('campaignCreate');
}
