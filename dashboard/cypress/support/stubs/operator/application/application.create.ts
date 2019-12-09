import { OperatorApplicationCreatedInterface } from '~/core/interfaces/operator/applicationInterface';

import { CypressExpectedApplication } from '../../../expectedApiPayload/expectedApplication';
import { operatorStub } from '../operator.find';

export function stubApplicationCreate() {
  cy.route({
    method: 'POST',
    url: 'applications',
    response: (data) =>
      <OperatorApplicationCreatedInterface>{
        application: {
          ...CypressExpectedApplication.getAfterCreate(),
          owner_id: operatorStub._id,
          permissions: ['journey.create'],
        },
        token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoiNWRhODYzMTgyYmY1YWMwMDM0NTA0MTRjIiwibyI6IjVjMzc0NzJmNzNjYjQ4MDAxNzBmYTFkZSIsInAiOlsiam91cm5leS5jcmVhdGUiXSwidiI6MiwiaWF0IjoxNTcxMzE2NTA0fQ.EU4TkuBcZmhGlYVpRKn0pG5S6u_huoiWz-uBtr56z4M',
      },
  }).as('applicationCreate');
}
