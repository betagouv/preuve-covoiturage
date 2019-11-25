import { JsonRPCResponse } from '~/core/entities/api/jsonRPCResponse';
import { Territory } from '~/core/entities/territory/territory';

import { territoryStubs } from '../territory/territory.list';

export const visibilityList = territoryStubs.reduce(
  (visibleTerritoryIds: number[], current: Territory, index: number) => {
    if (index % 2 === 0) {
      visibleTerritoryIds.push(current._id);
    }
    return visibleTerritoryIds;
  },
  [],
);

export function stubVisibilityList() {
  cy.route({
    method: 'POST',
    url: '/rpc?methods=territory:listOperator',
    response: (data) =>
      <JsonRPCResponse[]>[
        {
          id: 1568215196898,
          jsonrpc: '2.0',
          result: {
            data: visibilityList,
          },
        },
      ],
  });
}
