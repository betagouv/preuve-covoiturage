import { JsonRPCResponse } from '~/core/entities/api/jsonRPCResponse';
import { OperatorApplicationCreatedInterface } from '~/core/interfaces/operator/applicationInterface';

import { CypressExpectedApplication } from '../../../apiValues/expectedApplication';
import { operatorStub } from '../operator.find';

export function stubApplicationCreate() {
  cy.route({
    method: 'POST',
    url: '/rpc?methods=application:create',
    response: (data) =>
      <JsonRPCResponse[]>[
        {
          id: 1568215196898,
          jsonrpc: '2.0',
          result: {
            data: <OperatorApplicationCreatedInterface>{
              application: {
                ...CypressExpectedApplication.getAfterCreate(),
                operator_id: operatorStub._id,
                permissions: ['journey.create'],
              },
              token:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoiNWRhODYzMTgyYmY1YWMwMDM0NTA0MTRjIiwibyI6IjVjMzc0NzJmNzNjYjQ4MDAxNzBmYTFkZSIsInAiOlsiam91cm5leS5jcmVhdGUiXSwidiI6MiwiaWF0IjoxNTcxMzE2NTA0fQ.EU4TkuBcZmhGlYVpRKn0pG5S6u_huoiWz-uBtr56z4M',
            },
          },
        },
      ],
  }).as('applicationCreate');
}
