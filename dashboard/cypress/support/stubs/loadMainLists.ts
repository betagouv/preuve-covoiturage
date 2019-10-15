import { JsonRPCResponse } from '~/core/entities/api/jsonRPCResponse';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';

import { CampaignsGenerator } from '../generators/campaigns.generator';
import { campaignStubs } from './campaign/campaign.list';
import { territoryStubs } from './territory/territory.list';
import { operatorStubs } from './operator/operator.list';
import { territoryStub } from './territory/territory.find';

export function stubMainLists(group: UserGroupEnum) {
  let url = '/rpc?methods=';
  if (group === UserGroupEnum.TERRITORY) url += 'operator:list,territory:list,campaign:list,territory:find';
  if (group === UserGroupEnum.OPERATOR) url += 'operator:list,territory:list,campaign:list,operator:find';
  if (group === UserGroupEnum.REGISTRY) url += 'operator:list,territory:list,campaign:list';

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
      if (group === UserGroupEnum.TERRITORY) {
        ret.push({
          id: 1568215196898,
          jsonrpc: '2.0',
          result: {
            data: territoryStub,
            meta: null,
          },
        });
      }
      if (group === UserGroupEnum.OPERATOR) {
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
