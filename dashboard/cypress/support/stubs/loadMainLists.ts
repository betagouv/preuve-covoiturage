import { JsonRPCResponse } from '~/core/entities/api/jsonRPCResponse';
import { Groups } from '~/core/enums/user/groups';

import { CampaignsGenerator } from '../generators/campaigns.generator';
import { campaignStubs } from './campaign/campaign.list';
import { territoryStubs } from './territory/territory.list';
import { operatorStubs } from './operator/operator.list';
import { territoryStub } from './territory/territory.find';

export function stubMainLists(group: Groups) {
  let url = '/rpc?methods=';
  if (group === Groups.Territory) url += 'operator:list,territory:list,campaign:list,territory:find';
  if (group === Groups.Operator) url += 'operator:list,territory:list,campaign:list,operator:find';
  if (group === Groups.Registry) url += 'operator:list,territory:list,campaign:list';

  cy.route({
    url,
    method: 'POST',
    response: (data) => {
      const ret = <JsonRPCResponse[]>[
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
            meta: null,
          },
        },
      ];
      if (group === Groups.Territory) {
        ret.push({
          id: 1568215196898,
          jsonrpc: '2.0',
          result: {
            data: territoryStub,
            meta: null,
          },
        });
      }
      if (group === Groups.Operator) {
        ret.push({
          id: 1568215196898,
          jsonrpc: '2.0',
          result: {
            data: operatorStubs[0],
            meta: null,
          },
        });
      }
      return ret;
    },
  });
}
