import { JsonRPCResponse } from '~/core/entities/api/jsonRPCResponse';
import { StatsGenerator } from '../../generators/stats.generator';

export function stubStatList() {
  cy.route({
    method: 'POST',
    url: '/rpc?methods=trip:stats',
    response: (data) =>
      <JsonRPCResponse[]>[
        {
          id: 1568215196898,
          jsonrpc: '2.0',
          result: {
            data: StatsGenerator.generateStats,
          },
        },
      ],
  });
}
