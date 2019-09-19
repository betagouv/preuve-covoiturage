import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';
import { JsonRPCResponse } from '~/core/entities/api/jsonRPCResponse';

import { Campaign } from '../../../src/app/core/entities/campaign/campaign';
import { CypressExpectedCampaign } from '../formValues/expectedCampaign';

export const campaignStub: Campaign = {
  ...CypressExpectedCampaign.get(),
  _id: '5d7ba379c2cd1e4b02f971f5',
};

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
              ...campaignStub,
              status,
            },
          },
        },
      ],
  }).as('campaignCreate');
}
