import { JsonRPCResponse } from '~/core/entities/api/jsonRPCResponse';

import { CampaignsGenerator } from '../generators/campaigns.generator';
import { campaignStubs } from './campaign.list';
import { territoryStubs } from './territory.list';
import { operatorStubs } from './operator.list';
import { territoryStub } from './territory.find';

export function stubMainLists() {
  cy.route({
    method: 'POST',
    url: '/rpc?methods=operator:list,territory:list,campaign:list,territory:find',
    response: (data) =>
      <JsonRPCResponse[]>[
        {
          id: 1568215196897,
          jsonrpc: '2.0',
          result: {
            data: operatorStubs,
          },
        },
        {
          id: 1568215196889,
          jsonrpc: '2.0',
          result: {
            data: territoryStubs,
          },
        },
        {
          id: 1568215196898,
          jsonrpc: '2.0',
          result: {
            data: [...campaignStubs, ...CampaignsGenerator.list],
          },
        },
        {
          id: 1568215196898,
          jsonrpc: '2.0',
          result: {
            data: territoryStub,
          },
        },
      ],
  });
}
