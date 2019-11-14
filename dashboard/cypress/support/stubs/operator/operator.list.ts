import { Operator } from '~/core/entities/operator/operator';
import { JsonRPCResponse } from '~/core/entities/api/jsonRPCResponse';

import { operatorStub } from './operator.find';

export const operatorStubs: Operator[] = [
  operatorStub,
  {
    _id: 2,
    name: 'Opérateur 2',
    legal_name: 'Opérateur 2 SAS',
    company: {
      siren: '123456789',
      naf_entreprise: '1234A',
    },
    address: {
      street: '2 rue de brest',
      postcode: '69002',
      city: 'Lyon',
      country: 'France',
    },
  },
];

export function stubOperatorList() {
  cy.route({
    method: 'POST',
    url: '/rpc?methods=operator:list',
    response: (data) =>
      <JsonRPCResponse[]>[
        {
          id: 1568215196898,
          jsonrpc: '2.0',
          result: {
            data: operatorStubs,
          },
        },
      ],
  });
}
